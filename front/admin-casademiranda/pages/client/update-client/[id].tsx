import Navbar from "@/components/navbar/navbar";
import { Client } from "@/interfaces/client"
import * as APIClient from '@/services/clients';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function UpdateClient() {

    const { query } = useRouter();
    const router = useRouter();

    const [client, setClient] = useState<Client>();
    const [clientStatus, setClientStatus] = useState(200);
    const [bookingId, setBookingId] = useState(query !== undefined && query.booking_id !== undefined && typeof(query.booking_id) === "string"?query.booking_id:"");
    const [clientId, setClientId] = useState(query !== undefined && query.id !== undefined && typeof(query.id) === "string"?query.id:"");


    useEffect(() => {
        APIClient.getClientById(clientId).then(setClient).catch(console.log);
    }, []);

    const validData = (client: Client|undefined) => {
        if(client === undefined){
            return false;
        }
        return true;
    }

    const handleSubmit = () => {

        if (!validData(client)) {
            
            alert('Los datos del cliente no son validos')
            return new Error('Invalid client data')
        }

        client?APIClient.updateClient({...client, booking_id: bookingId}).then(res => router.push("/booking/"+res?.booking_id+"/check-in")).catch(console.log):console.log('Invalid client', JSON.stringify(client));


    }

    return (
        <>
            <Navbar></Navbar>
            <h1>Actualizar Cliente: </h1>
            {client?(<div id="registroCliente">
                <form id="mi-formulario" onSubmit={handleSubmit}>
                    <div id="datos-cliente">

                        <div className="formulario-elemento">
                            <label id="fecha-checkin">Fecha de check-in:</label>
                            <input type="date" id="fecha-checkin" name="fechaCheckIn" value={client.check_in?new Date(client.check_in).toISOString().split('T')[0]:new Date().toISOString().split('T')[0]} onChange={(e) => setClient({...client, check_in: new Date(e.target.value)})} required />
                        </div>
                        <div className="formulario-elemento">
                            <label id="nacionality">Nacionalidad:</label>
                            <select id="nacionality" name="nacionality" value={client.nacionality} onChange={(e) => setClient({...client, nacionality: e.target.value})}>
                                <option value="">- Pais de Nacionalidad -</option>
                                <option value="ESPAÑA">ESPAÑA</option>
                                <option value="AFGANISTAN">AFGANISTAN</option>
                                <option value="ALBANIA">ALBANIA</option>
                                <option value="ALEMANIA">ALEMANIA</option>
                                <option value="ANDORRA">ANDORRA</option>
                                <option value="ANGOLA">ANGOLA</option>
                                <option value="ANGUILA">ANGUILA</option>
                                <option value="ANTARTIDA">ANTARTIDA</option>
                                <option value="ANTIGUA Y BARBUDA">ANTIGUA Y BARBUDA</option>
                                <option value="ARABIA SAUDITA">ARABIA SAUDITA</option>
                                <option value="ARGELIA">ARGELIA</option>
                                <option value="ARGENTINA">ARGENTINA</option>
                                <option value="ARMENIA">ARMENIA</option>
                                <option value="ARUBA">ARUBA</option>
                                <option value="AUSTRALIA">AUSTRALIA</option>
                                <option value="AUSTRIA">AUSTRIA</option>
                                <option value="AZERBAYAN">AZERBAYAN</option>
                                <option value="BAHAMAS">BAHAMAS</option>
                                <option value="BAHREIN">BAHREIN</option>
                                <option value="BANGLADESH">BANGLADESH</option>
                                <option value="BARBADOS">BARBADOS</option>
                                <option value="BELGICA">BELGICA</option>
                                <option value="BELICE">BELICE</option>
                                <option value="BENIN">BENIN</option>
                                <option value="BIELORUSIA">BIELORUSIA</option>
                                <option value="BOLIVIA">BOLIVIA</option>
                                <option value="BOSNIA HERZEGOVINA">BOSNIA HERZEGOVINA</option>
                                <option value="BOTSWANA">BOTSWANA</option>
                                <option value="BRASIL">BRASIL</option>
                                <option value="BRUNEI">BRUNEI</option>
                                <option value="BULGARIA">BULGARIA</option>
                                <option value="BURKINA FASO">BURKINA FASO</option>
                                <option value="BURUNDI">BURUNDI</option>
                                <option value="BUTAN">BUTAN</option>
                                <option value="CABO VERDE">CABO VERDE</option>
                                <option value="CAMBOYA">CAMBOYA</option>
                                <option value="CAMERUN">CAMERUN</option>
                                <option value="CANADA">CANADA</option>
                                <option value="CHAD">CHAD</option>
                                <option value="CHECOSLOVAQUIA">CHECOSLOVAQUIA</option>
                                <option value="CHILE">CHILE</option>
                                <option value="CHINA">CHINA</option>
                                <option value="CHIPRE">CHIPRE</option>
                                <option value="CISKEY">CISKEY</option>
                                <option value="COLOMBIA">COLOMBIA</option>
                                <option value="COMORAS">COMORAS</option>
                                <option value="CONGO">CONGO</option>
                                <option value="COREA DEL NORTE">COREA DEL NORTE</option>
                                <option value="COREA DEL SUR">COREA DEL SUR</option>
                                <option value="COSTA DE MARFIL">COSTA DE MARFIL</option>
                                <option value="COSTA RICA">COSTA RICA</option>
                                <option value="CROACIA">CROACIA</option>
                                <option value="CUBA">CUBA</option>
                                <option value="DINAMARCA">DINAMARCA</option>
                                <option value="DJIBUTI">DJIBUTI</option>
                                <option value="DOMINICA">DOMINICA</option>
                                <option value="ECUADOR">ECUADOR</option>
                                <option value="EGIPTO">EGIPTO</option>
                                <option value="EL SALVADOR">EL SALVADOR</option>
                                <option value="EMIRATOS ARABES">EMIRATOS ARABES</option>
                                <option value="ERITREA">ERITREA</option>
                                <option value="ESLOVAQUIA">ESLOVAQUIA</option>
                                <option value="ESLOVENIA">ESLOVENIA</option>
                                <option value="ESPAÑA">ESPAÑA</option>
                                <option value="ESTADOS UNIDOS">ESTADOS UNIDOS</option>
                                <option value="ESTONIA">ESTONIA</option>
                                <option value="ETIOPIA">ETIOPIA</option>
                                <option value="FIDJI(ISLAS)">FIDJI(ISLAS)</option>
                                <option value="FILIPINAS">FILIPINAS</option>
                                <option value="FINLANDIA">FINLANDIA</option>
                                <option value="FRANCIA">FRANCIA</option>
                                <option value="GABON">GABON</option>
                                <option value="GAMBIA">GAMBIA</option>
                                <option value="GEORGIA">GEORGIA</option>
                                <option value="GHANA">GHANA</option>
                                <option value="GRANADA">GRANADA</option>
                                <option value="GRECIA">GRECIA</option>
                                <option value="GUATEMALA">GUATEMALA</option>
                                <option value="GUINEA">GUINEA</option>
                                <option value="GUINEA BISAU">GUINEA BISAU</option>
                                <option value="GUINEA ECUATORIAL">GUINEA ECUATORIAL</option>
                                <option value="GUYANA">GUYANA</option>
                                <option value="HAITI">HAITI</option>
                                <option value="HOLANDA">HOLANDA</option>
                                <option value="HONDURAS">HONDURAS</option>
                                <option value="HONG KONG (CHINA)">HONG KONG (CHINA)</option>
                                <option value="HONG KONG (GB)">HONG KONG (GB)</option>
                                <option value="HUNGRIA">HUNGRIA</option>
                                <option value="INDIA">INDIA</option>
                                <option value="INDONESIA">INDONESIA</option>
                                <option value="IRAK">IRAK</option>
                                <option value="IRAN">IRAN</option>
                                <option value="IRLANDA">IRLANDA</option>
                                <option value="ISLANDIA">ISLANDIA</option>
                                <option value="ISRAEL">ISRAEL</option>
                                <option value="ITALIA">ITALIA</option>
                                <option value="JAMAICA">JAMAICA</option>
                                <option value="JAPON">JAPON</option>
                                <option value="JORDANIA">JORDANIA</option>
                                <option value="KAZAJISTAN">KAZAJISTAN</option>
                                <option value="KENIA">KENIA</option>
                                <option value="KIRIBATI">KIRIBATI</option>
                                <option value="KIRJISTAN">KIRJISTAN</option>
                                <option value="KUWAIT">KUWAIT</option>
                                <option value="LAOS">LAOS</option>
                                <option value="LESOTO">LESOTO</option>
                                <option value="LETONIA">LETONIA</option>
                                <option value="LIBANO">LIBANO</option>
                                <option value="LIBERIA">LIBERIA</option>
                                <option value="LIBIA">LIBIA</option>
                                <option value="LIECHTENSTEIN">LIECHTENSTEIN</option>
                                <option value="LITUANIA">LITUANIA</option>
                                <option value="LUXEMBURGO">LUXEMBURGO</option>
                                <option value="MACAO">MACAO</option>
                                <option value="MADAGASCAR">MADAGASCAR</option>
                                <option value="MALASIA">MALASIA</option>
                                <option value="MALAUI">MALAUI</option>
                                <option value="MALDIVAS">MALDIVAS</option>
                                <option value="MALI">MALI</option>
                                <option value="MALTA">MALTA</option>
                                <option value="MARIANAS DEL NORTE">MARIANAS DEL NORTE</option>
                                <option value="MARRUECOS">MARRUECOS</option>
                                <option value="MARSHALL">MARSHALL</option>
                                <option value="MAURICIO">MAURICIO</option>
                                <option value="MAURITANIA">MAURITANIA</option>
                                <option value="MEXICO">MEXICO</option>
                                <option value="MICRONESIA">MICRONESIA</option>
                                <option value="MOLDAVIA">MOLDAVIA</option>
                                <option value="MONACO">MONACO</option>
                                <option value="MONGOLIA">MONGOLIA</option>
                                <option value="MOZAMBIQUE">MOZAMBIQUE</option>
                                <option value="MYANMAR(BIRMANIA)">MYANMAR(BIRMANIA)</option>
                                <option value="NAMIBIA">NAMIBIA</option>
                                <option value="NAURU">NAURU</option>
                                <option value="NEPAL">NEPAL</option>
                                <option value="NICARAGUA">NICARAGUA</option>
                                <option value="NIGER">NIGER</option>
                                <option value="NIGERIA">NIGERIA</option>
                                <option value="NORUEGA">NORUEGA</option>
                                <option value="NUEVA ZELANDA">NUEVA ZELANDA</option>
                                <option value="OMAN">OMAN</option>
                                <option value="ONU">ONU</option>
                                <option value="PAKISTAN">PAKISTAN</option>
                                <option value="PALAOS">PALAOS</option>
                                <option value="PALESTINA">PALESTINA</option>
                                <option value="PANAMA">PANAMA</option>
                                <option value="PAPUA NUEVA GUINEA">PAPUA NUEVA GUINEA</option>
                                <option value="PARAGUAY">PARAGUAY</option>
                                <option value="PERU">PERU</option>
                                <option value="POLONIA">POLONIA</option>
                                <option value="PORTUGAL">PORTUGAL</option>
                                <option value="QATAR">QATAR</option>
                                <option value="REFUGIADO">REFUGIADO</option>
                                <option value="REINO UNIDO">REINO UNIDO</option>
                                <option value="REP. CENTROAFRICANA">REP. CENTROAFRICANA</option>
                                <option value="REP. CHECA">REP. CHECA</option>
                                <option value="REP. DOMINICANA">REP. DOMINICANA</option>
                                <option value="REP. MACEDONIA">REP. MACEDONIA</option>
                                <option value="RUANDA">RUANDA</option>
                                <option value="RUMANIA">RUMANIA</option>
                                <option value="RUSIA">RUSIA</option>
                                <option value="SAHARA OCCIDENTAL">SAHARA OCCIDENTAL</option>
                                <option value="SAMOA OCCIDENTAL">SAMOA OCCIDENTAL</option>
                                <option value="SAN CRISTOBAL NEVIS">SAN CRISTOBAL NEVIS</option>
                                <option value="SAN MARINO">SAN MARINO</option>
                                <option value="SANTA LUCIA">SANTA LUCIA</option>
                                <option value="SANTO TOME PRINCIPE">SANTO TOME PRINCIPE</option>
                                <option value="SENEGAL">SENEGAL</option>
                                <option value="SERBIA">SERBIA</option>
                                <option value="SERBIA MONTENEGRO">SERBIA MONTENEGRO</option>
                                <option value="SEYCHELLES">SEYCHELLES</option>
                                <option value="SIERRA LEONA">SIERRA LEONA</option>
                                <option value="SIN ESTADO">SIN ESTADO</option>
                                <option value="SINGAPUR">SINGAPUR</option>
                                <option value="SIRIA">SIRIA</option>
                                <option value="SOMALIA">SOMALIA</option>
                                <option value="SRI LANKA">SRI LANKA</option>
                                <option value="SUAZILANDIA">SUAZILANDIA</option>
                                <option value="SUDAFRICA">SUDAFRICA</option>
                                <option value="SUDAN">SUDAN</option>
                                <option value="SUECIA">SUECIA</option>
                                <option value="SUIZA">SUIZA</option>
                                <option value="SURINAM">SURINAM</option>
                                <option value="S.VICENTE Y GRANAD.">S.VICENTE Y GRANAD.</option>
                                <option value="TAIWAN">TAIWAN</option>
                                <option value="TANZANIA">TANZANIA</option>
                                <option value="TAYIKISTAN">TAYIKISTAN</option>
                                <option value="THAILANDIA">THAILANDIA</option>
                                <option value="TIMOR">TIMOR</option>
                                <option value="TOGO">TOGO</option>
                                <option value="TONGA">TONGA</option>
                                <option value="TRANSKEY">TRANSKEY</option>
                                <option value="TRINIDAD Y TOBAGO">TRINIDAD Y TOBAGO</option>
                                <option value="TUNEZ">TUNEZ</option>
                                <option value="TURKMENISTAN">TURKMENISTAN</option>
                                <option value="TURQUIA">TURQUIA</option>
                                <option value="TUVALU">TUVALU</option>
                                <option value="UCRANIA">UCRANIA</option>
                                <option value="UGANDA">UGANDA</option>
                                <option value="URSS">URSS</option>
                                <option value="URUGUAY">URUGUAY</option>
                                <option value="UZBEKISTAN">UZBEKISTAN</option>
                                <option value="VANUATU">VANUATU</option>
                                <option value="VATICANO">VATICANO</option>
                                <option value="VENDA">VENDA</option>
                                <option value="VENEZUELA">VENEZUELA</option>
                                <option value="VIETNAM">VIETNAM</option>
                                <option value="YEMEN">YEMEN</option>
                                <option value="YUGOSLAVIA">YUGOSLAVIA</option>
                                <option value="ZAIRE">ZAIRE</option>
                                <option value="ZAMBIA">ZAMBIA</option>
                                <option value="ZIMBABUE">ZIMBABUE</option>
                                <option value="ZONA NEUTRAL">ZONA NEUTRAL</option>
                            </select>
                        </div>

                        <div className="formulario-elemento">
                            <label id="documentType">Tipo documento:</label>
                            <select name="documentType" id="documentType" onChange={e => setClient({...client, document_type: e.target.value})} value={client.document_type} required>
                                <option value="">- Tipo Documento -</option>
                                <option value="P">pasaporte</option>
                                {client.nacionality && client.nacionality === 'ESPAÑA'?(<option value="C">permiso de conducir</option>):<></>}
                                {client.nacionality && client.nacionality === 'ESPAÑA'?(<option value="D">documento nacional de identidad</option>):(<option value="I">documento de identidad</option>)}
                                {client.nacionality && client.nacionality !== 'ESPAÑA'?(<option value="N">permiso residencia español</option>):<></>}
                                {client.nacionality && client.nacionality !== 'ESPAÑA'?(<option value="X">permiso residencia extranjero</option>):<></>}
                            </select>
                        </div>

                        <div className="formulario-elemento">
                            <label id="documentNumber">Número documento:</label>
                            <input type="text" id="documentNumber" name="documentNumber" value={client.document_number} onChange={(e) =>  setClient({...client, document_number: e.target.value})} required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="expeditionDate">Fecha de expedición:</label>
                            <input type="date" id="expeditionDate" name="expeditionDate" value={client.expedition_date?new Date(client.expedition_date).toISOString().split('T')[0]:""} onChange={(e) => setClient({...client, expedition_date: new Date(e.target.value)})} required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="nombre">Nombre:</label>
                            <input type="text" id="nombre" name="nombre" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="firstSurname">Primer apellido:</label>
                            <input type="text" id="firstSurname" name="firstSurname" value={client.firstSurname} onChange={(e) => setClient({...client, firstSurname: e.target.value})} required />
                        </div>

                        <div className="formulario-elemento">
                            <label id="secondSurname">Segundo apellido:</label>
                            <input type="text" id="secondSurname" name="secondSurname" value={client.secondSurname} onChange={(e) => setClient({...client, secondSurname: e.target.value})} required />
                        </div>


                        <div className="formulario-elemento">
                            <label id="gender">Genero:</label>
                            <select id="selectorGender" onChange={(e) => setClient({...client, gender: e.target.value})} value={client.gender} name="gender">
                                <option value="">--Selecciona una opción--</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div className="formulario-elemento">
                            <label id="birthdate">Fecha de nacimiento:</label>
                            <input type="date" id="birthdate" name="birthdate" value={client.birthdate?new Date(client.birthdate).toISOString().split('T')[0]:""} onChange={(e) => setClient({...client, birthdate: new Date(e.target.value)})} required />
                        </div>

                        <div className="formulario-elemento" id="boton-enviar">
                            <button type="submit">Actualizar</button>
                        </div>
                    </div>
                </form>
            </div>):<></>}

        </>
    )
}