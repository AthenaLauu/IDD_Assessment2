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

let currentAnimal = null;


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
    // Change note depending on colour area
    if (xPercent < 20) {
        currentAnimal.dataset.pitch = "C4";
    }
    else if (xPercent < 40) {
        currentAnimal.dataset.pitch = "D4";
    }
    else if (xPercent < 60) {
        currentAnimal.dataset.pitch = "E4";
    }
    else if (xPercent < 80) {
        currentAnimal.dataset.pitch = "G4";
    }
    else {
        currentAnimal.dataset.pitch = "A4";
    }
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

    // // Snap animal to nearest note
    // snapToNote(currentAnimal);

    currentAnimal = null;

    window.removeEventListener("mousemove", moveAnimal);
    window.removeEventListener("mouseup", stopDragging);
}


// Snap animal to nearest note
function snapToNote(animal) {

    let currentY = parseFloat(animal.style.top);

    // Note positions
    const notes = [
        { position: 5, pitch: "F5" },
        { position: 15, pitch: "E5" },
        { position: 25, pitch: "D5" },
        { position: 35, pitch: "C5" },
        { position: 45, pitch: "B4" },
        { position: 55, pitch: "A4" },
        { position: 65, pitch: "G4" },
        { position: 75, pitch: "F4" },
        { position: 85, pitch: "E4" },
        { position: 95, pitch: "D4" }
    ];


    // Start with first note
    let closestNote = notes[0];


    // Find closest note
    notes.forEach((note) => {

        let distance =
            Math.abs(currentY - note.position);

        let closestDistance =
            Math.abs(currentY - closestNote.position);

        if (distance < closestDistance) {
            closestNote = note;
        }
    });


    // Move animal to note
    animal.style.top = `${closestNote.position}%`;


    // Save note
    animal.dataset.pitch = closestNote.pitch;
}


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

        // Clear note
        delete animal.dataset.pitch;
    });
});


/////
// This is a basic scroll event listener
/////

// find our document (the web page) information as the listener runs on it instead an element : see below
//const page = document.documentElement;
//const body = document.body;
//const scrollPercentSpan = document.getElementById("scrollPercentSpan");

// the event listener is added to the document itself, rather than an element, so I can get the page scroll position. it
// can also be applied to a single element, if that element also has a scroll bar based on overflow
// because its a scroll event we need to set it to passive - see here for more detail :
// https://stackoverflow.com/questions/37721782/what-are-passive-event-listeners
//document.addEventListener('scroll', handleScroll, { passive: true });

//function handleScroll(){
//    scrollPercentSpan.textContent = getScrollPercent();
//}

//function getScrollPercent() {
// we want to find the percentage of the page scrolled
// scrollTop is how far it is scrolled, scrollHeight is total height : dividing one by the other gives us our percent
// we also have to minus the height of the window (clientHeight) to account for the end of the page
// in practice this leads to the bottom being slightly over 1.0 but it's good enough for this
//const scrollPercent = page.scrollTop / (page.scrollHeight - page.clientHeight);

// finally we want to return this as a percentage number, so we mult by 100 then round it to whole numbers
//return parseInt(scrollPercent * 100);