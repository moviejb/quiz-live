const QUESTIONS = [
  {
    "id": 0,
    "disciplina": "Geografia",
    "argomento": "Puzzle foto",
    "type": "image-order",
    "question": "Guarda l’immagine sullo schermo e rimetti in ordine i pezzi sul telefono.",
    "questionImage": "img/quiz/geografia/vienna.jpg",
    "questionImageAlt": "Panorama di Bruxelles",
    "time": 25,
    "points": 150,
    "explain": "L’ordine corretto ricomponeva la foto di Bruxelles.",
    "rows": 3,
    "cols": 3
  },
  {
    "id": 1,
    "disciplina": "Geografia",
    "argomento": "Capitali europee",
    "type": "multiple",
    "question": "Qual è la capitale del Belgio?",
    "questionImage": "img/quiz/geografia/bruxelles.jpg",
    "questionImageAlt": "Panorama di Bruxelles",
    "time": 15,
    "points": 100,
    "explain": "Bruxelles è la capitale del Belgio.",
    "options": [
      {
        "text": "Bruxelles",
        "image": "img/quiz/geografia/bruxelles.jpg"
      },
      {
        "text": "Parigi",
        "image": "img/quiz/geografia/parigi.jpg"
      },
      {
        "text": "Amsterdam",
        "image": "img/quiz/geografia/amsterdam.jpg"
      },
      {
        "text": "Vienna",
        "image": "img/quiz/geografia/vienna.jpg"
      }
    ],
    "correctIndex": 0
  },
  {
    "id": 2,
    "disciplina": "Geografia",
    "argomento": "Monumenti",
    "type": "image-pieces",
    "question": "Che luogo è questo?",
    "questionImage": "img/quiz/geografia/bruxelles.jpg",
    "time": 20,
    "points": 120,
    "explain": "L’immagine mostrava Bruxelles.",
    "options": [
      "Bruxelles",
      "Parigi",
      "Amsterdam",
      "Vienna"
    ],
    "correctIndex": 0,
    "revealSteps": 8
  },
  {
    "id": 3,
    "disciplina": "Geografia",
    "argomento": "Capitali europee",
    "type": "multiple",
    "question": "Qual è la capitale del Belgio?",
    "questionImage": "img/quiz/geografia/bruxelles.jpg",
    "questionImageAlt": "Panorama di Bruxelles",
    "time": 15,
    "points": 100,
    "explain": "Bruxelles è la capitale del Belgio.",
    "options": [
      {
        "text": "",
        "image": "img/quiz/geografia/bruxelles.jpg"
      },
      {
        "text": "",
        "image": "img/quiz/geografia/parigi.jpg"
      },
      {
        "text": "",
        "image": "img/quiz/geografia/amsterdam.jpg"
      },
      {
        "text": "",
        "image": "img/quiz/geografia/vienna.jpg"
      }
    ],
    "correctIndex": 0
  },
  {
    "id": 4,
    "disciplina": "Scienze",
    "argomento": "Animali",
    "type": "truefalse",
    "question": "L’animale in foto è un mammifero.",
    "questionImageAlt": "Pipistrello appeso",
    "time": 10,
    "points": 100,
    "explain": "Il pipistrello è un mammifero.",
    "correctAnswer": true
  },
  {
    "id": 5,
    "disciplina": "Italiano",
    "argomento": "Vocabolario",
    "type": "text",
    "question": "Scrivi il nome di ciò che vedi.",
    "questionImage": "img/quiz/italiano/ciliegie.jpg",
    "questionImageAlt": "Un grappolo di ciliegie",
    "time": 20,
    "points": 120,
    "explain": "La risposta corretta è 'ciliegie'.",
    "correctAnswers": [
      "ciliegie"
    ]
  },
  {
    "id": 6,
    "disciplina": "Storia",
    "argomento": "Cronologia",
    "type": "order",
    "question": "Metti in ordine cronologico dal più antico al più recente.",
    "time": 25,
    "points": 150,
    "explain": "L’ordine corretto è Preistoria → Medioevo → Età moderna.",
    "items": [
      {
        "id": "mod",
        "text": "Età moderna",
        "image": ""
      },
      {
        "id": "pre",
        "text": "Preistoria",
        "image": ""
      },
      {
        "id": "med",
        "text": "Medioevo",
        "image": ""
      }
    ],
    "correctOrder": [
      "pre",
      "med",
      "mod"
    ]
  },
  {
    "id": 7,
    "disciplina": "Scienze",
    "argomento": "Animali",
    "type": "multiple",
    "question": "Quale immagine mostra un mammifero marino?",
    "time": 15,
    "points": 100,
    "options": [
      {
        "text": "Delfino",
        "image": "img/quiz/scienze/delfino.jpg"
      },
      {
        "text": "Squalo",
        "image": "img/quiz/scienze/squalo.jpg"
      },
      {
        "text": "Polpo",
        "image": "img/quiz/scienze/polpo.jpg"
      },
      {
        "text": "Trota",
        "image": "img/quiz/scienze/trota.jpg"
      }
    ],
    "correctIndex": 0
  }
];

if (typeof window !== 'undefined') {
  window.QUESTIONS = QUESTIONS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS;
}
