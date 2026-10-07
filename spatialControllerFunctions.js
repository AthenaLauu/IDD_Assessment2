/////
/* this is slightly more simple implementation of the previous xy controller */
/* !!important!! this only works because the xyPad has been given a CSS position property, in this case relative */
/* e.layerX or e.layerY only work when they have one (doesn't need to be relative) */
/* also important is that we've set the marker to pointer-events: none in the CSS so that we can listen for events on the pad*/
/////
const synth = new Tone.PolySynth().toDestination();

const xyPad = document.getElementById("xyPad");
const animalArea = document.getElementById("animalArea");

const animals = document.querySelectorAll(".animal");

const playButton = document.getElementById("playButton");
const redoButton = document.getElementById("redoButton");

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


        // Add area to music space
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


    // Find centre of animal
    const animalRect =
        currentAnimal.getBoundingClientRect();

    const animalX =
        animalRect.left +
        animalRect.width / 2;

    const animalY =
        animalRect.top +
        animalRect.height / 2;


    // Find all sound areas
    const zones =
        document.querySelectorAll(".sound-zone");


    // Clear old note
    delete currentAnimal.dataset.pitch;


    // Check which area the animal is in
    zones.forEach((zone) => {

        const zoneRect =
            zone.getBoundingClientRect();


        if (
            animalX >= zoneRect.left &&
            animalX <= zoneRect.right &&
            animalY >= zoneRect.top &&
            animalY <= zoneRect.bottom
        ) {

            // Give animal the area's note
            currentAnimal.dataset.pitch =
                zone.dataset.pitch;
        }
    });


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


    // Get animals with notes
    const placedAnimals =
        Array.from(
            xyPad.querySelectorAll(".animal.placed")
        ).filter((animal) => {

            return animal.dataset.pitch;
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

        let pitch =
            animal.dataset.pitch;

        let delay =
            index * 500;


        setTimeout(() => {

            // Play note
            synth.triggerAttackRelease(
                pitch,
                "8n"
            );


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


        // Clear note
        delete animal.dataset.pitch;
    });


    // Create new random areas
    createSoundZones();
});
