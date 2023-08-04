import { useState, useEffect } from 'react';

export default function NewBooking() {


    const [selectedRoom, setSelectedRoom] = useState("");

    function agregarHabitacion() {

    }

    return (
        <>
            <h1>New Booking: </h1>
            <div id="registroReservas">
                <p> Registro de reservas </p>
                <form id="mi-formulario">
                    <div id="datos-reserva">
                        <div className="formulario-elemento">
                            <label id="nombre">Nombre:</label>
                            <input type="text" id="nombre" name="nombre" required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="apellidos">Apellidos:</label>
                            <input type="text" id="apellidos" name="apellidos" required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="dni">DNI:</label>
                            <input type="text" id="dni" name="dni" required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="email">Email:</label>
                            <input type="text" id="email" name="email" required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="confirmationEmail">Confirmación email:</label>
                            <input type="text" id="confirmation-email" name="confirmation-email" required />
                        </div>


                        <div className="formulario-elemento">
                            <label id="fecha-checkin">Fecha de check-in:</label>
                            <input type="date" id="fecha-checkin" name="fechaCheckIn" required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="fecha-checkout">Fecha de check-out:</label>
                            <input type="date" id="fecha-checkout" name="fechaCheckOut" required />
                        </div>

                        <div className="formulario-elemento">
                            <label>Desea enviar email de confirmacion:
                                <input type="checkbox" name="envioConfirmacion" id="confirmation-send-mail" />
                            </label>
                        </div>
                    </div>

                    <div id="datos-habitacion">
                        <div className="formulario-elemento">
                            <label id="selectorhabitacion">Selecciona una habitación:</label>
                            <select id="selectorhabitacion" onChange={e => {setSelectedRoom(e.target.value);}} value={selectedRoom} name="habitacion">
                                <option value="">--Selecciona una opción--</option>
                                <option value="A Fonte">A Fonte</option>
                                <option value="O Carpinteiro">O Carpinteiro</option>
                                <option value="O Cuberto">O Cuberto</option>
                                <option value="O Faiado">O Faiado</option>
                            </select>
                        </div>

                        {selectedRoom!==""&&selectedRoom!==undefined?(
                            <div>
                                <div className="formulario-elemento" id="precio">
                                    <label id="precio">Precio</label>
                                    <input type="text" id="preciohab" name="precio" />
                                </div>

                                <div className="formulario-elemento" id="supletoria" >
                                    <label id="numerosupl">Número de supletorias:</label>
                                    <input type="text" id="numerosupl" name="numsupletoria" />
                                    <label id="preciosupl">Precio de cada supletoria:</label>
                                    <input type="text" id="preciosupl" name="preciosupletoria" />
                                    <div className="formulario-elemento" id="boton-hatitacion">
                                        <button type="button" onClick={agregarHabitacion}> Añadir habitación </button>
                                    </div>
                                </div>
                            </div>
                        ):(
                            <div></div>
                        )}

                    </div>

                    <ul id="lista-habitaciones"></ul>

                    <div className="formulario-elemento" id="boton-enviar">
                        <button type="submit">Registro reserva</button>
                    </div>
                </form>
            </div>
        </>
    )
}