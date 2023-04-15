window.addEventListener("load", () => {

    function sendForm() {

        const datosFormulario = {};
        for (var pair of new FormData(form).entries()) {
            const clave = pair[0];
            const valor = pair[1];
            datosFormulario[clave] = valor;
        }

        console.log(JSON.stringify(datosFormulario));
        $.ajax({
            url: 'http://localhost:3000/factura',
            method: 'POST',
            data: datosFormulario,
            success: function () {
                $('#mi-formulario')[0].reset();
            }
        });
    }

    const form = document.getElementById("mi-formulario");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendForm();
    });
});

function mostrarCampos() {
    var selector = document.getElementById("selectorhabitacion");
    var opcionSeleccionada = selector.value;

    if (opcionSeleccionada != null) {
        document.getElementById("precio").style.display = "block";
        document.getElementById("supletoria").style.display = "block";
    } else {
        document.getElementById("precio").style.display = "none";
        document.getElementById("supletoria").style.display = "none";
    }
}