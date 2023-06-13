var A = ['H','Li','Na','K'];
var B = ['F','Cl','Br','I'];
var C = ['O','S','Se'];
var elementsArray = [];

AFRAME.registerComponent('MarkerHandler',{
    init: async function() {
        console.log('init');
        var compounds = this.getCompounds();
        this.el.addEventListener('markerFound',()=>{
            var elementName = this.el.getAttribute('element_name');
            var barcodeValue = this.el.getAttribute('value');
            elementsArray.push({
                element_name: elementName,
                barcodeValue: barcodeValue
            });
            compounds[barcodeValue]['compounds'].map(item => {
                var compound = document.querySelector(`#${item.compound_name}-${barcodeValue}`);
                compound.setAttribute('visible',false);
                var atom = document.querySelector(`#${elementName}-${barcodeValue}`);
                atom.setAttribute('visible',true);
            });
        });
        this.el.addEventListener('markerLost',()=>{
            var elementName = this.el.getAttribute('element_name');
            var i = elementsArray.findIndex(elementName);
            if(i>-1) {
                elementsArray.splice(i,1);
            }
        });
    },
    getCompounds: function () {
        return fetch("js/compoundList.json")
          .then(res => res.json())
          .then(data => data);
    },
    getDistance: function(elementA, elementB) {
        return elementA.object3D.position.distanceTo(elementB.object3D.position);
    },
    countOccurences: function(array, value) {
        return array.reduce((a,v) => (v.element_name==value?a++:a),0);
    },
    getCompound: function() {
        for(var element of elementsArray) {
            if(A.includes(element.element_name)) {
                var compound = element.element_name;
                for(var i of elementsArray) {
                    if(B.includes(i.element_name)) {
                        compound += i.element_name;
                        return {name: compound, value: element.barcodeValue};
                    }
                    if(C.includes(i.element_name)) {
                        var count = this.countOccurences(elementsArray,element.element_name);
                        if(count > 1) {
                            compound += count + i.element_name;
                            return {name: compound, value: i.barcodeValue}
                        }
                    }
                }
            }
        }
    },
    showCompound: function(compound) {
        elementsArray.map(item=>{
            var el = document.querySelector(`#${item.element_name}-${item.barcodeValue}`);
            el.setAttribute('visible',false); // hide element
            var compound = document.querySelector(`#${compound.name}-${compound.value}`);
            compound.setAttribute('visible',true); // show compound
        });
    },
    tick: function() {
        console.log(elementsArray);
        if(elementsArray.length > 1) {
            var length = elementsArray.length;
            var distance = null;
            var message = document.querySelector('#messageText');
            var compound = this.getCompound();
            console.log(length);
            if(length === 2) {
                var marker1 = document.querySelector(`#marker-${elementsArray[0].barcodeValue}`);
                var marker2 = document.querySelector(`#marker-${elementsArray[1].barcodeValue}`);
                distance = this.getDistance(marker1,marker2);
                if(distance < 1.25) {
                    if(compound != undefined) {
                        this.showCompound(compound);
                    } else {
                        message.setAttribute('visible',true);
                    }
                } else {
                    message.setAttribute('visible',false);
                }
            }
            if(length === 3) {
                var marker1 = document.querySelector(`#marker-${elementsArray[0].barcodeValue}`);
                var marker2 = document.querySelector(`#marker-${elementsArray[1].barcodeValue}`);
                var marker3 = document.querySelector(`#marker-${elementsArray[2].barcodeValue}`);
                var distance1 = this.getDistance(marker1,marker2);
                var distance2 = this.getDistance(marker1,marker3);
                if(distance1 < 1.25 && distance2 < 1.25) {
                    if(compound != undefined) {
                        var barcodeValue = elementsArray[0].barcodeValue;
                        this.showCompound(compound,barcodeValue);
                    } else {
                        message.setAttribute('visible',true);
                    }
                } else {
                    message.setAttribute('visible',false);
                }
            }
        }
    }
});