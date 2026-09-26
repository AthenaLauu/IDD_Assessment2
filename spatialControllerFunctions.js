/////
/* Spatial input prototype */
/* Colour areas appear in random positions */
/* Each area has a random note */
/* Overlapping colours play animal sounds */
/* X position changes play order */
/////

const synth = new Tone.PolySynth().toDestination();

const xyPad = document.getElementById("xyPad");
const animalArea = document.getElementById("animalArea");

const animals = document.querySelectorAll(".animal");

const playButton = document.getElementById("playButton");
const redoButton = document.getElementById("redoButton");
const refreshButton = document.getElementById("refreshButton");

let currentAnimal = null;


// Notes for random areas
const notes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5"
];


// Colours for sound areas
const colours = [
    "#ffb3b3",
    "#fff0a6",
    "#b8e6b8",
    "#b8d8f5",
    "#d8b8e8"
];


// Create random sound areas
function createSoundZones() {

    // Remove old areas
    const oldZones =
        xyPad.querySelectorAll(".sound-zone");

    oldZones.forEach((zone) => {
        zone.remove();
    });


    // Create new areas
    colours.forEach((colour) => {

        const zone =
            document.createElement("div");

        zone.classList.add("sound-zone");


        // Random position
        let x = Math.random() * 75;
        let y = Math.random() * 70;

        zone.style.left = `${x}%`;
        zone.style.top = `${y}%`;


        // Add colour
        zone.style.backgroundColor = colour;


        // Choose random note
        let randomNote =
            notes[
                Math.floor(
                    Math.random() * notes.length
                )
                ];


        // Save note
        zone.dataset.pitch = randomNote;


        // Add area
        xyPad.appendChild(zone);
    });
}


// Create areas when page starts
createSoundZones();


// Start dragging animal
animals.forEach((animal) => {

    animal.addEventListener("mousedown", async (e) => {

        await Tone.start();

        currentAnimal = animal;


        // Move animal into music area
        if (!animal.classList.contains("placed")) {

            xyPad.appendChild(animal);

            animal.classList.add("placed");
        }


        moveAnimal(e);

        window.addEventListener(
            "mousemove",
            moveAnimal
        );

        window.addEventListener(
            "mouseup",
            stopDragging
        );
    });
});


// Move animal
function moveAnimal(e) {

    if (!currentAnimal) {
        return;
    }


    const rect =
        xyPad.getBoundingClientRect();


    let xPos =
        e.clientX - rect.left;

    let yPos =
        e.clientY - rect.top;


    let xPercent =
        (xPos / rect.width) * 100;

    let yPercent =
        (yPos / rect.height) * 100;


    // Keep animal inside music area
    xPercent =
        Math.max(
            0,
            Math.min(100, xPercent)
        );

    yPercent =
        Math.max(
            0,
            Math.min(100, yPercent)
        );


    // Move animal
    currentAnimal.style.left =
        `${xPercent}%`;

    currentAnimal.style.top =
        `${yPercent}%`;
}


// Stop dragging
function stopDragging() {

    if (!currentAnimal) {
        return;
    }


    // Find animal centre
    const animalRect =
        currentAnimal.getBoundingClientRect();

    const animalX =
        animalRect.left +
        animalRect.width / 2;

    const animalY =
        animalRect.top +
        animalRect.height / 2;


    // Find colour areas
    const zones =
        document.querySelectorAll(".sound-zone");

    let foundZones = [];


    // Check which areas animal is inside
    zones.forEach((zone) => {

        const zoneRect =
            zone.getBoundingClientRect();


        if (
            animalX >= zoneRect.left &&
            animalX <= zoneRect.right &&
            animalY >= zoneRect.top &&
            animalY <= zoneRect.bottom
        ) {

            foundZones.push(zone);
        }
    });


    // Overlapping colours
    if (foundZones.length >= 2) {

        currentAnimal.dataset.useAnimalSound =
            "true";

        delete currentAnimal.dataset.pitch;
    }


    // One colour
    else if (foundZones.length === 1) {

        currentAnimal.dataset.pitch =
            foundZones[0].dataset.pitch;

        currentAnimal.dataset.useAnimalSound =
            "false";
    }


    // Outside colour areas
    else {

        delete currentAnimal.dataset.pitch;

        currentAnimal.dataset.useAnimalSound =
            "false";
    }


    currentAnimal = null;


    window.removeEventListener(
        "mousemove",
        moveAnimal
    );

    window.removeEventListener(
        "mouseup",
        stopDragging
    );
}


// Play animals from left to right
playButton.addEventListener("click", async () => {

    await Tone.start();


    // Get animals with sounds
    const placedAnimals =
        Array.from(
            xyPad.querySelectorAll(".animal.placed")
        ).filter((animal) => {

            return animal.dataset.pitch ||
                animal.dataset.useAnimalSound === "true";
        });


    // Sort animals left to right
    placedAnimals.sort((a, b) => {

        let aPosition =
            parseFloat(a.style.left);

        let bPosition =
            parseFloat(b.style.left);

        return aPosition - bPosition;
    });


    // Play each animal
    placedAnimals.forEach((animal, index) => {

        let delay =
            index * 500;


        setTimeout(() => {

            // Play animal sound
            if (
                animal.dataset.useAnimalSound === "true"
            ) {

                const animalSound =
                    new Audio(animal.dataset.sound);

                animalSound.play();
            }


            // Play normal note
            else {

                synth.triggerAttackRelease(
                    animal.dataset.pitch,
                    "8n"
                );
            }


            // Make animal bigger
            animal.style.transform =
                "translate(-50%, -50%) scale(1.8)";


            // Return to normal size
            setTimeout(() => {

                animal.style.transform =
                    "translate(-50%, -50%) scale(1)";

            }, 300);

        }, delay);
    });
});


// Refresh sound areas
refreshButton.addEventListener("click", () => {

    // Create new random areas
    createSoundZones();


    // Clear old sounds
    animals.forEach((animal) => {

        delete animal.dataset.pitch;

        animal.dataset.useAnimalSound =
            "false";
    });
});


// Redo the music
redoButton.addEventListener("click", () => {

    animals.forEach((animal) => {

        // Move animal back outside
        animalArea.appendChild(animal);

        animal.classList.remove("placed");


        // Clear position
        animal.style.left = "";
        animal.style.top = "";
        animal.style.transform = "";


        // Clear sounds
        delete animal.dataset.pitch;

        animal.dataset.useAnimalSound =
            "false";
    });
});


/////
// This is a basic scroll event listener
/////

// find our document (the web page) information as the listener runs on it instead an element : see below
//const page = document.documentElement;
//const body = document.body;
//const scrollPercentSpan = document.getElementById("scrollPercentSpan");

// the event listener is added to the document itself, rather than an element, so I can get the page scroll position.
// because its a scroll event we need to set it to passive
//document.addEventListener('scroll', handleScroll, { passive: true });

//function handleScroll(){
//    scrollPercentSpan.textContent = getScrollPercent();
//}

//function getScrollPercent() {

//const scrollPercent =
//    page.scrollTop /
//    (page.scrollHeight - page.clientHeight);

//return parseInt(scrollPercent * 100);
//}