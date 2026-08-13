var Billy = Billy || {};

(function () {
  var PHASES = [
    {
      id: 'house',
      number: 1,
      name: 'Casa',
      nextId: 'street',
      playable: true,
      clearTitle: 'Casa concluída!',
      clearLine: 'Billy foi corajoso. O Patinho ainda está perdido...',
    },
    {
      id: 'street',
      number: 2,
      name: 'A Rua',
      nextId: 'beach',
      playable: false,
      clearTitle: 'A Rua concluída!',
      clearLine: 'Os cachorros grandes ficaram para trás.',
      comingLine: 'Em breve Billy corre pela cidade atrás do Patinho.',
    },
    {
      id: 'beach',
      number: 3,
      name: 'A Praia',
      nextId: 'grandma',
      playable: false,
      clearTitle: 'Praia concluída!',
      clearLine: 'Billy achou o Patinho Amarelo!',
      comingLine: 'Em breve o reencontro na areia.',
    },
    {
      id: 'grandma',
      number: 4,
      name: 'Casa da Vó',
      nextId: null,
      playable: false,
      isFinale: true,
      clearTitle: 'Você venceu!',
      clearLine: 'Billy e o Patinho estão juntos na casa da vovó.',
      comingLine: 'Em breve a festa na casa da vovó.',
    },
  ];

  function get(id) {
    for (var i = 0; i < PHASES.length; i++) {
      if (PHASES[i].id === id) return PHASES[i];
    }
    return PHASES[0];
  }

  function next(id) {
    var cur = get(id);
    if (!cur || !cur.nextId) return null;
    return get(cur.nextId);
  }

  function createLevel(id) {
    var spec = get(id);
    if (!spec || !spec.playable) return null;
    if (spec.id === 'house') return Billy.Levels.createHouse();
    return null;
  }

  Billy.Campaign = {
    phases: PHASES,
    get: get,
    next: next,
    createLevel: createLevel,
  };
})();
