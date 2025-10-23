import React, {useEffect, useState} from "react";
import axios from "axios";
import {useSearchParams} from "react-router-dom";

function UserRegistration() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState({
        name:"",
        age:"",
        country:"",
        story:"",
        photoYear:"",
        photos:[],
    });

    const [verified, setVerified] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyToken = async() => {
            try {
                const res = await axios.get(`http://localhost:3000/emails/verify-token?token=${token}`);
                setEmail(res.data.email);
                setVerified (true);
            } catch (error) {
                setMessage("El enlace ha expirado o no es valido.");
            }
        };
        verifyToken();
    }, [token]);


    const handleChange = async (e) => {
        const {name, value, files} = e.target;
        if (name === "photos") {
            setFormData({ ...formData, photos: Array.from(files) });
        } else { 
            setFormData({ ...formData, [name] : value})
        }
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading (true);
    
const data = new FormData();
    data.append ("name", formData.name);
    data.append ("age", formData.age);
    data.append ("country", formData.country);
    data.append ("story", formData.story);
    data.append ("photoYear", formData.photoYear);
    data.append ("email", email);
    formData.photos.forEach((file)=> data.append("photos", file))

    try {
        const res = await axios.post ("http://localhost:3000/emails/complete", data,);
        setMessage (res.data.message);
    }catch (error) {
        setMessage (error.response?.data?.message || "An error occurred during registration.");
    }finally {
        setLoading(false);
    }
};

if(!verified) return <p>{message || "Verifying link..."} </p>;

return (
    <div className="registro-container">
        <h2>Completa tu registro</h2>
        <form onSubmit={handleSubmit}>
            <input type="email" value={email} disabled />
            <input type="name" name="name" placeholder="Nombre" onChange={handleChange} required />
            <input type="number" name="age" placeholder="Edad" onChange={handleChange} required />
            <input type="text" name="country" placeholder="Pais" onChange={handleChange} required />
            <input type="number" name="photoYear" placeholder="Año de la foto principal" onChange={handleChange} required />
            <textarea name="story" placeholder="Tu historia" onChange={handleChange} required></textarea>
            <input type="file" name="photos" multiple onChange={handleChange} required />
            <button type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar"}
            </button>
        </form>
        {message && <p className="mensaje">{message}</p>}
    </div>
    );
}

export default UserRegistration;