window.addEventListener('load', () => {
    startForm('mi-formulario');
});


function sendForm(formularioId) {
    const formulario = document.getElementById(formularioId);

    console.log(formulario)
    const datosFormulario = new FormData(formulario);

    const url = "http://localhost:3000/factura"; 
    const parametros = {
        method: "POST",
        body: datosFormulario 
    };

console.log(JSON.stringify(datosFormulario));

    fetch(url, parametros)
        .then(respuesta => {
            console.log("Formulario enviado correctamente");
            formulario.reset();
        })
        .catch(error => {
            console.error("Error al enviar el formulario:", error);
        });
}

function startForm(formularioId) {
    const formulario = document.getElementById(formularioId);

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        sendForm(formularioId);
    });
}



function mostrarCampos() {
    var selector = document.getElementById("selectorhabitacion");
    var opcionSeleccionada = selector.value;

    if (opcionSeleccionada == "afonte") {
        document.getElementById("precio").style.display = "block";
    } else if (opcionSeleccionada == "opcion2") {
        document.getElementById("precio").style.display = "block";
    } else if (opcionSeleccionada == "opcion3") {
        document.getElementById("precio").style.display = "block";
    } else {
        document.getElementById("precio").style.display = "none";
    }
}