AFRAME.registerComponent("atoms", {
  init: async function () {

    //Get the compund details of the element
    var compounds = await this.getCompounds();

    var barcodes = Object.keys(compounds);

    barcodes.map(barcode => {
      var element = compounds[barcode];

      //Call the function
      this.createAtoms(element);
    });

  },
  getCompounds: function () {
    return fetch("js/compoundList.json")
      .then(res => res.json())
      .then(data => data);
  },
  getElementColors: function () {
    return fetch("js/elementColors.json")
      .then(res => res.json())
      .then(data => data);
  },
  createAtoms: async function (element) {

    //Element data
    var elementName = element.element_name;
    var barcodeValue = element.barcode_value;
    var numOfElectrons = element.number_of_electron;

    //Get the color of the element
    var colors = await this.getElementColors();

    //Scene
    var scene = document.querySelector("a-scene");

    //Add marker entity for BARCODE marker
    var marker = document.createElement("a-marker");

    marker.setAttribute("id", `marker-${barcodeValue}`);
    marker.setAttribute("type", "barcode");
    marker.setAttribute("element_name", elementName);
    marker.setAttribute("value", barcodeValue);
    marker.setAttribute("markerhandler",{});

    scene.appendChild(marker);

    var atom = document.createElement("a-entity");
    atom.setAttribute("id", `${elementName}-${barcodeValue}`);
    marker.appendChild(atom);

    //Create atom card
    var card = document.createElement("a-entity");
    card.setAttribute("id", `card-${elementName}`);
    card.setAttribute("geometry", {
      primitive: "plane",
      width: 1,
      height: 1
    });

    card.setAttribute("material", {
      src: `./assets/atom_cards/card_${elementName}.png`
    });

    card.setAttribute("position", { x: 0, y: 0, z: 0 });
    card.setAttribute("rotation", { x: -90, y: 0, z: 0 });

    atom.appendChild(card);

    //Create nucleus
    var nucleusRadius = 0.2;
    var nucleus = document.createElement("a-entity");
    nucleus.setAttribute("id", `nucleus-${elementName}`);
    nucleus.setAttribute("geometry", {
      primitive: "sphere",
      radius: nucleusRadius
    });

    nucleus.setAttribute("material", "color", colors[elementName]);
    nucleus.setAttribute("position", { x: 0, y: 1, z: 0 });

    nucleus.setAttribute("rotation", { x: 0, y: 0, z: 0 });

    var nucleusName = document.createElement("a-entity");
    nucleusName.setAttribute("id", `nucleus-name-${elementName}`);
    nucleusName.setAttribute("position", { x: 0, y: 0.21, z: -0.06 });
    nucleusName.setAttribute("rotation", { x: -90, y: 0, z: 0 });
    nucleusName.setAttribute("text", {
      font: "monoid",
      width: 3,
      color: "black",
      align: "center",
      value: elementName
    });

    nucleus.appendChild(nucleusName);

    atom.appendChild(nucleus);
    
    
    var orbitAngle = -180, electronAngle = 30;
    for(var i = 1; i <= numOfElectrons;i++) {
        var orbit = document.createElement('a-entity');
        orbit.setAttribute('geometry', {
            primitive: 'torus',
            arc: 360,
            radius: 0.28,
            radiusTubular: 0.0001
        });
        orbit.setAttribute('material', {
            color: 'grey',
            opacity: 0.3
        });
        orbit.setAttribute('position', {
            x: 0,
            y: 1,
            z: 0
        });
        orbit.setAttribute('rotation', {
            x: 0,
            y: orbitAngle,
            z: 0
        });
        orbitAngle += 45;
        atom.appendChild(orbit);

        var electronGroup = document.createElement('a-entity');
        electronGroup.setAttribute('id', `electronGroup${elementName}`);
        electronGroup.setAttribute('rotation', {
            x: 0,
            y: 0,
            z: electronAngle
        });
        electronGroup.setAttribute('animation', {
            property: 'rotation',
            to: '0 0 -360',
            loop: 'true',
            dur: 3500,
            easing: 'linear'
        });
        atom.appendChild(electronGroup);

        var electron = document.createElement('a-entity');
        electron.setAttribute('id', `electron${elementName}`);
        electron.setAttribute('geometry', {
            primitive: 'sphere',
            radius: 0.02
        });
        electron.setAttribute('material', {
            color: 'lightblue',
            opacity: 0.6
        });
        electron.setAttribute('position', {
            x: 0.2,
            y: 0.2,
            z: 0
        });
        electronAngle += 65;
        electronGroup.appendChild(electron);
    }
    var compounds = element.compounds;
    compounds.map(compound => {
      var compoundEnt = document.createElement('a-entity');
      compoundEnt.setAttribute('id',`${compound.compound_name}-${barcodeValue}`);
      compoundEnt.setAttribute('visible',false);
      marker.appendChild(compoundEnt);
      var compoundCard = document.createElement('a-entity');
      compoundCard.setAttribute('id',`compound-card-${compound.compound_name}`);
      compoundCard.setAttribute('geometry',{
        primitive: 'plane',
        width: 1.2,
        height: 1.7
      });
      compoundCard.setAttribute('material',{
        src: `../assets/compound_cards/card_${compound.compound_name}.png`
      });
      compoundCard.setAttribute('position',{
        x: 0,
        y: 0,
        z: 0.2
      });
      compoundCard.setAttribute('rotation',{
        x: -90,
        y: 0,
        z: 0
      });
      compoundEnt.appendChild(compoundCard);
      var xPos = 0;
      compound.elements.map((m,index) => {
        var nuc = document.createElement('a-entity');
        nuc.setAttribute('id',`compound-nucleus-${m}`);
        nuc.setAttribute('geometry',{
          primitive: 'sphere',
          radius: 0.2
        });
        nuc.setAttribute('material',{
          color: colors[m]
        });
        nuc.setAttribute('position',{
          x: xPos,
          y: 1,
          z: 0
        });
        xPos+=0.3;
        compoundEnt.appendChild(nuc);
        var nucName = document.createElement('a-entity');
        nucName.setAttribute('id',`compound-nucleus-name-${m}`);
        nucName.setAttribute('position',{
          x: 0,
          y: 0.21,
          z: 0
        });
        nucName.setAttribute('rotation',{
          x: -90,
          y: 0,
          z: 0
        });
        nucName.setAttribute('text',{
          font: 'monoid',
          width: 3,
          color: 'black',
          align: 'center',
          value: m
        });
        nuc.appendChild(nucName);
      });
    });

    
  }
});
