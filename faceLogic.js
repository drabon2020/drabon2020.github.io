
setTimeout(function () {
    ruisantos.FaceComponent5.StaticInstance.ReceiveData("Ready");
    ruisantos.FaceComponent5.StaticInstance.refreshData();
    StartAR("");
}, 500)

var found = false;

function StartAR(image) {
    const video = document.getElementById('video')

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://drabon2020.github.io'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://drabon2020.github.io'),
        faceapi.nets.faceRecognitionNet.loadFromUri('https://drabon2020.github.io'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://drabon2020.github.io'),
        faceapi.nets.ageGenderNet.loadFromUri('https://drabon2020.github.io')
    ]).then(startVideo)

    function startVideo() {
        navigator.getUserMedia(
            { video: {} },
            stream => video.srcObject = stream,
            err => console.error(err)
        ).then(alert("Loaded"));
    }

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        canvas.setAttribute("style", "position: absolute;margin-left: 0px;padding: 0;display: flex;")

        var parent = document.getElementById('video');
        var mainParent = parent.parentNode;
        mainParent.insertBefore(canvas, parent);

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            
            if (detections.length == 0 && found) {
                ruisantos.FaceComponent5.StaticInstance.ReceiveData("No Face Found");
                found = false;
            }
            else if (detections.length > 0 && !found) {
                resizedDetections.forEach( detection => {
                ruisantos.FaceComponent5.StaticInstance.ReceiveData( Math.round(detection.age) + " year old " + detection.gender)});
                found = true;
            }
            ruisantos.FaceComponent5.StaticInstance.refreshData();
           
            const anchor = { x: 100, y: 100 }
             /*// see DrawTextField below
            const drawOptions = {
            anchorPosition: 'TOP_LEFT',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
            */
            
            
          //Write to screen
            //faceapi.draw.drawDetections(canvas, resizedDetections)
            
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            
            resizedDetections.forEach( detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
            drawBox.draw(canvas)
    })
            
            
        }, 100)
    })
}
