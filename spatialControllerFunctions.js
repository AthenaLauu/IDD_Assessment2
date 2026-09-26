/////
/* this is slightly more simple implementation of the previous xy controller */
/* !!important!! this only works because the xyPad has been given a CSS position property, in this case relative */
/* e.layerX or e.layerY only work when they have one (doesn't need to be relative) */
/* also important is that we've set the marker to pointer-events: none in the CSS so that we can listen for events on the pad*/
/////

/////
/* Spatial input prototype */
/* Animals can be dragged onto different notes */
/* Y position changes pitch */
/* X position changes play order */
/////

const synth = new Tone.PolySynth().toDestination();

const xyPad = document.getElementById("xyPad");
const animalArea = document.getElementById("animalArea");

const animals = document.querySelectorAll(".animal");

const playButton = document.getElementById("playButton");
const redoButton = document.getElementById("redoButton");
const pitchButton = document.getElementById("pitchButton");

let highNotes = false;
let currentAnimal = null;

// Normal notes
const normalNotes = [
    "F4",
    "E4",
    "D4",
    "C4",
    "B3",
    "A3",
    "G3",
    "F3",
    "E3",
    "D3"
];

// Higher notes
const higherNotes = [
    "F6",
    "E6",
    "D6",
    "C6",
    "B5",
    "A5",
    "G5",
    "F5",
    "E5",
    "D5"
];


// Start dragging an animal
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

        window.addEventListener("mousemove", moveAnimal);
        window.addEventListener("mouseup", stopDragging);
    });
});


// Move animal with mouse
function moveAnimal(e) {

    if (!currentAnimal) {
        return;
    }

    const rect = xyPad.getBoundingClientRect();

    let xPos = e.clientX - rect.left;
    let yPos = e.clientY - rect.top;

    let xPercent = (xPos / rect.width) * 100;
    let yPercent = (yPos / rect.height) * 100;


    // Keep animal inside music area
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));


    // Move animal
    currentAnimal.style.left = `${xPercent}%`;
    currentAnimal.style.top = `${yPercent}%`;
}


// Stop dragging
function stopDragging() {

    if (!currentAnimal) {
        return;
    }

    // Snap animal to nearest note
    snapToNote(currentAnimal);

    currentAnimal = null;

    window.removeEventListener("mousemove", moveAnimal);
    window.removeEventListener("mouseup", stopDragging);
}


// Snap animal to nearest note
function snapToNote(animal) {

    let currentY =
        parseFloat(animal.style.top);

    // Choose note range
    let currentNotes;

    if (highNotes === true) {
        currentNotes = higherNotes;
    } else {
        currentNotes = normalNotes;
    }

    // Note positions
    const positions = [
        5,
        15,
        25,
        35,
        45,
        55,
        65,
        75,
        85,
        95
    ];

    // Start with first position
    let closestIndex = 0;

    // Find closest position
    positions.forEach((position, index) => {

        let distance =
            Math.abs(currentY - position);

        let closestDistance =
            Math.abs(
                currentY -
                positions[closestIndex]
            );

        if (distance < closestDistance) {
            closestIndex = index;
        }
    });

    // Move animal to note
    animal.style.top =
        `${positions[closestIndex]}%`;

    // Save note
    animal.dataset.pitch =
        currentNotes[closestIndex];
}

// Change between normal and higher notes
pitchButton.addEventListener("click", () => {

    // Change note range
    highNotes = !highNotes;

    // Change button text
    if (highNotes === true) {
        pitchButton.textContent = "Lower Notes";
    } else {
        pitchButton.textContent = "Higher Notes";
    }

    // Update animals already on the lines
    const placedAnimals =
        xyPad.querySelectorAll(".animal.placed");

    placedAnimals.forEach((animal) => {
        snapToNote(animal);
    });
});


// Play animals from left to right
playButton.addEventListener("click", async () => {

    await Tone.start();

    // Get animals in music area
    const placedAnimals =
        Array.from(
            xyPad.querySelectorAll(".animal.placed")
        );

    // Sort animals from left to right
    placedAnimals.sort((a, b) => {

        let aPosition = parseFloat(a.style.left);
        let bPosition = parseFloat(b.style.left);

        return aPosition - bPosition;
    });

    // Play each animal
    placedAnimals.forEach((animal, index) => {

        let pitch = animal.dataset.pitch;

        let delay = index * 500;

        setTimeout(() => {

            // Play note
            synth.triggerAttackRelease(pitch, "8n");

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
});