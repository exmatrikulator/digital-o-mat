$(document).ready(function() {

  // number of maximum divergence
  var MAXDIV = 4;

  // party matrix
  var parties = {
    "fdp": ["FDP", "Freie Demokratische Partei"],
    "gruene": ["Grüne", "Bündnis_90/Die_Grünen"],
    "linke": ["Linke", "Die Linke"],
    "spd": ["SPD", "Sozialdemokratische Partei Deutschlands"]
  };

  var keys = ["Ablehnung--", "Ablehnung-", "Neutral", "Zustimmung+", "Zustimmung++"];

  // caches
  var $window = $(window);
  var $body = $("body");

  // check view
  var mobile = ($window.width() >= 960) ? false : true;
  $body.toggleClass("mobile", mobile);
  $window.resize(function() {
    if (mobile && $window.width() >= 960) mobile = false, $body.toggleClass("mobile", mobile);
    if (!mobile && $window.width() < 960) mobile = true, $body.toggleClass("mobile", mobile);
  });

  // template
  var tmpl = {
    questions: $("#tmpl-questions").html(),
    result: $("#tmpl-result").html(),
  };

  // render questions
  $("#questions").html(Mustache.render(tmpl.questions, {
    question: window.omatdata.questions.map(function(data, id) {
      return {
        id: id,
        label: data[0],
        question: data[1],
        num: (id + 1)
      };
    })
  }));

  // activate questions
  $("input[type=radio]", "#questions").click(function(evt) {
    // if all questions are answered
    if ($("#questions").serializeArray().length === window.omatdata.questions.length) {
      // go straight to evaluation
      calculate();
      scroll($("#result").offset().top - 100, 200);
    } else if (mobile) {
      // go to next question
      var nxt = $(this).parents(".question").next();
      if (nxt.length > 0 && nxt.css("display") == "block") scroll(nxt.offset().top + (nxt.height() / 2) - ($window.height() / 2), 200);
    }
  });

  function disable_all() {
    $("#div_Boden").css("display", "none");
    $(".q_Boden").css("display", "none");
    $("#b_Boden").css("display", "none");

    $("#div_Finanzierung").css("display", "none");
    $(".q_Finanzierung").css("display", "none");
    $("#b_Finanzierung").css("display", "none");

    $("#div_Förderung").css("display", "none");
    $(".q_Förderung").css("display", "none");
    $("#b_Förderung").css("display", "none");

    $("#div_Recht").css("display", "none");
    $(".q_Recht").css("display", "none");
    $("#b_Recht").css("display", "none");

    $("#b_calculate").css("display", "none");

  };

  function show_start() {
    disable_all();
    $("#app").attr("class", "show-intro");
    $("#intro").css("display", "block");
    $("#b_zurück").css("display", "none");
    scroll(0, 200);
  };

  function show_Boden() {
    disable_all();
    $("#div_Boden").css("display", "block");
    $(".q_Boden").css("display", "block");
    $("#b_Finanzierung").css("display", "block");
    scroll(0, 200);
  };

  function show_Finanzierung() {
    disable_all();
    $("#div_Finanzierung").css("display", "block");
    $(".q_Finanzierung").css("display", "block");
    $("#b_Förderung").css("display", "block");
    scroll(0, 200);
  };

  function show_Förderung() {
    disable_all();
    $("#div_Förderung").css("display", "block");
    $(".q_Förderung").css("display", "block");
    $("#b_Recht").css("display", "block");
    scroll(0, 200);
  };

  function show_Recht() {
    disable_all();
    $("#div_Recht").css("display", "block");
    $(".q_Recht").css("display", "block");
    $("#calculate").css("display", "block");
    scroll(0, 200);
  };

  // activate button
  $("#activate").click(function(evt) {
    evt.preventDefault();
    $("#app").attr("class", "show-questionaire");
    $("#intro").css("display", "none");
    $("#b_zurück").css("display", "block");
    show_Boden();
  });

  $("#b_zurück").click(function(evt) {
    if ($(".q_Finanzierung").css("display") == "block") {
      show_Boden();
    } else if ($(".q_Förderung").css("display") == "block") {
      show_Finanzierung();
    } else if ($(".q_Recht").css("display") == "block") {
      show_Förderung();
    } else {
      show_start();
    }
  });

  $("#b_Finanzierung").click(function(evt) {
    evt.preventDefault();
    show_Finanzierung();
  });

  $("#b_Förderung").click(function(evt) {
    evt.preventDefault();
    show_Förderung();
  });

  $("#b_Recht").click(function(evt) {
    evt.preventDefault();
    show_Recht();
  });

  // calculate button
  $("#calculate").click(function(evt) {
    calculate();
  });

  // burger menu
  $("#burger").click(function(evt) {
    evt.preventDefault();
    $("#header").toggleClass("show-menu");
  });

  function calculate() {

    // prepare result array
    var result = {

      // flatten answers
      answers: $("#questions").serializeArray().reduce(function(p, c) {
        p[parseInt(c.name.replace(/[^0-9]+/g, ''), 10)] = parseInt(c.value, 10);
        return p;
      }, Array(window.omatdata.questions.length)),

      // empty comparison array
      comparison: Array(window.omatdata.parties.length),

      /*
      .reduce(function(p,c){
      	p[c[0]] = 0;
      	return p;
      },{})
      */

      // transform answer data to templatable data structure
      detail: []

    };

    //set default value ( not with .fill(), because ie doen't like it)
    for (i = 0; i < window.omatdata.questions.length; i++) {
      if (typeof result.answers[i] == "undefined")
        result.answers[i] = null;
    }
    for (i = 0; i < window.omatdata.parties.length; i++) {
      if (typeof result.comparison[i] == "undefined")
        result.comparison[i] = 0;
    }

    // calculate score
    result.answers.forEach(function(v, i) {

      _paq.push(['trackEvent', 'Immomat', 'Frage ' + (i + 1), 'Antwort ' + (v !== null ? v : 'null')]);

      // ignore not-given answers
      if (v === null) return;

      window.omatdata.answers[i].forEach(function(a, j) {

        // if no valid answer from party, use max divergence
        if (typeof a[0] !== "number" || a[0] < 0 || a[0] > MAXDIV) return (result.comparison[j] += MAXDIV);

        // else calculate divergence
        result.comparison[j] += (MAXDIV - Math.abs(a[0] - v));
      });

    });

    // calculate maximum score
    var max = (result.answers.filter(function(v) {
      return v !== null
    }).length * MAXDIV);

    // transform comparison into templatable data structure and sort by score
    result.comparison = result.comparison.map(function(c, i) {
      return {
        score: c,
        percent: (Math.round((c / max) * 100) || 0).toString(),
        width: (((c / max) * 100) || 0).toFixed(1),
        party: window.omatdata.parties[i],
        party_short: parties[window.omatdata.parties[i]][0],
        party_long: parties[window.omatdata.parties[i]][1]
      };
    }).sort(function(a, b) {
      return (b.score - a.score);
    });

    // prepare detailed answers
    result.detail = window.omatdata.answers.map(function(v, i) {
      return {
        id: i,
        num: (i + 1),
        label: window.omatdata.questions[i][0],
        question: window.omatdata.questions[i][1],
        answers: [4, 3, 2, 1, 0].map(function(a) {
          return {
            selected: (result.answers[i] === a),
            answer_label: keys[a],
            answer_type: a,
            parties: window.omatdata.answers[i].map(function(pa, j) {
              return {
                answer: pa[0],
                has_explanation: (pa[1]) ? true : false,
                explanation: pa[1] || null,
                party: window.omatdata.parties[j],
                party_short: parties[window.omatdata.parties[j]][0],
                party_long: parties[window.omatdata.parties[j]][1]
              };
            }).filter(function(pa) {
              return pa.answer === a
            })
          };
        })
      };
    });

    // render result to document
    $("#result").html(Mustache.render(tmpl.result, result));

    // activate detail
    $(".party.explanation h5", "#detail").click(function(evt) {
      evt.preventDefault();
      $(this).parent().toggleClass("show-explanation");
    });

    disable_all();
    $("#b_zurück").css("display", "none");
    $(".q_Boden").css("display", "block");
    $(".q_Finanzierung").css("display", "block");
    $(".q_Förderung").css("display", "block");
    $(".q_Recht").css("display", "block");
    scroll(($("#result").offset().top - 100), 200);

  };

  function scroll(to, duration) {
    if (duration < 0) return;

    var difference = to - $window.scrollTop();
    var perTick = difference / duration * 10;

    this.scrollToTimerCache = setTimeout(function() {
      if (!isNaN(parseInt(perTick, 10))) {
        window.scrollTo(0, $window.scrollTop() + perTick);
        scroll(to, duration - 10);
      }
    }.bind(this), 10);
  };


}); // [42003,17236,36130925,24365,638511].map(function(v){ return v.toString(36); }).join(" "); // <- verschwörungstheorie!
