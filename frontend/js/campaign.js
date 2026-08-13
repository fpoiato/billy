var Billy = Billy || {};

(function () {
  var PHASES = [
    {
      id: 'house',
      number: 1,
      name: 'Casa',
      nextId: 'papai',
      playable: true,
      clearTitle: 'Casa concluída!',
      clearLine: 'O Patinho Amarelo apareceu no fim da casa!',
    },
    {
      id: 'papai',
      number: 2,
      name: 'Passear com o Papai',
      nextId: 'street',
      playable: true,
      clearTitle: 'Passeio concluído!',
      clearLine: 'O papai comeu, Billy puxou, e o Patinho apareceu no parque!',
    },
    {
      id: 'street',
      number: 3,
      name: 'A Rua',
      nextId: 'beach',
      playable: true,
      clearTitle: 'A Rua concluída!',
      clearLine: 'O Patinho estava no portão. Um encontro e... CENSURADO!',
    },
    {
      id: 'beach',
      number: 4,
      name: 'A Praia',
      nextId: 'grandma',
      playable: true,
      clearTitle: 'Praia concluída!',
      clearLine: 'Billy achou o Patinho Amarelo!',
    },
    {
      id: 'grandma',
      number: 5,
      name: 'Casa da Vó',
      nextId: null,
      playable: true,
      isFinale: true,
      clearTitle: 'Você venceu!',
      clearLine: 'Camila apertou, mas Billy achou o Patinho na casa da vovó.',
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
    if (spec.id === 'papai') return Billy.Levels.createPapai();
    if (spec.id === 'street') return Billy.Levels.createStreet();
    if (spec.id === 'beach') return Billy.Levels.createBeach();
    if (spec.id === 'grandma') return Billy.Levels.createGrandma();
    return null;
  }

  Billy.Campaign = {
    phases: PHASES,
    get: get,
    next: next,
    createLevel: createLevel,
  };
})();
