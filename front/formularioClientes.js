var habitaciones = [];

window.addEventListener("load", () => {

    function sendForm() {

        const datosFormulario = {};
        for (var pair of new FormData(form).entries()) {
            const clave = pair[0];
            console.log(clave);
            var valor = pair[1];
            if(clave != "habitacion" && clave != "precio" && clave != "numsupletoria" && clave != "preciosupletoria" ){
                datosFormulario[clave] = valor;
            }
        }

        if(habitaciones.length == 0){
            console.error("La lista de habitaciones no puede ser vacia")
            alert("La lista de habitaciones no puede ser vacia");
            return null;
        }
        datosFormulario["habitaciones"] = JSON.stringify(habitaciones); // TODO esto deberia cambiarse para ser objeto completo e non escaparse
        console.log(datosFormulario);
        console.log(JSON.stringify(datosFormulario));
        $.ajax({
            url: 'http://localhost:3000/factura',
            method: 'POST',
            data: datosFormulario,
            success: function () {
                $('#mi-formulario')[0].reset();
                habitaciones = [];
                document.getElementById("lista-habitaciones").innerHTML = "";
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

function agregarHabitacion() {
    var lista = document.getElementById("lista-habitaciones");
    var selector = document.getElementById("selectorhabitacion");
    var opcionSeleccionada = selector.value;
    var precioHabitacion = document.getElementById("preciohab").value;
    var numsupletoria = document.getElementById("numerosupl").value;
    var preciosupl = document.getElementById("preciosupl").value;

    if (opcionSeleccionada == "" || precioHabitacion == "" || numsupletoria == "") {
        console.log("Los datos de la habitación son insuficientes");
        alert("Los datos de la habitación son insuficientes");
        return null;
    }

    if (numsupletoria > 0 && preciosupl == "") {
        console.log("Si el numero de supletorias es mayor que 0 se tiene que añadir el precio ");
        alert("Si el numero de supletorias es mayor que 0 se tiene que añadir el precio ");
        return null;
    }

    var habitacionObjeto = { "habitacion": opcionSeleccionada, "precio": precioHabitacion, "supletorias": numsupletoria, "precioSupletoria": preciosupl };

    habitaciones.push(habitacionObjeto);
    var elemento = document.createElement("li");
    var texto = document.createTextNode(opcionSeleccionada);
    elemento.appendChild(texto);
    lista.appendChild(elemento);

    selector.value = "";
    document.getElementById("preciohab").value = "";
    document.getElementById("numerosupl").value = "";
    document.getElementById("preciosupl").value = "";

}

function obtenerHabitacion(nombre) {
    for (var i = 0; i < habitaciones.length; i++) {
        if (habitaciones[i].habitacion == nombre) {
            return habitaciones[i];
        }
    }

    return null;
}
