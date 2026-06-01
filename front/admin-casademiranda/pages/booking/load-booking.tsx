import React, { useState, ChangeEvent } from "react";
import * as APIBooking from "../../services/bookings";
import { useRouter } from 'next/router';

const ExcelUploader = () => {

    const router = useRouter()
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };
    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona un archivo primero");
            return;
        }

        APIBooking.loadBookingBatch(file).then(res => {
            setUploadStatus(res);
            router.push("/");
        }).catch(error => {
            setUploadStatus(error);
            console.log(error)
        });

    };

    return (
        <div>
            <h2>Subir Excel</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleUpload}>Subir</button>
            <p>{uploadStatus}</p>
        </div>
    );
};

export default ExcelUploader;