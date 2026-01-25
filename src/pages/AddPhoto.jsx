import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import ReactFlagsSelect from "react-flags-select";

const API = import.meta.env.VITE_API_URL;

function AddPhotos() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [lockedData, setLockedData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm();

  // 🔐 Validar token + traer datos del usuario
  useEffect(() => {
    const init = async () => {
      // 1️⃣ Verificar token
      const tokenRes = await axios.get(
        `${API}/emails/verify-token?token=${token}`
      );

      if (tokenRes.data.action !== "edit") {
        throw new Error("Token inválido");
      }

      setEmail(tokenRes.data.email);

      // 2️⃣ Traer datos del usuario
      const userRes = await axios.get(
        `${API}/emails/me?email=${tokenRes.data.email}`
      );

      setLockedData(userRes.data);

      // 3️⃣ Precargar valores
      setValue("name", userRes.data.name);
      setValue("age", userRes.data.age);
      setValue("country", userRes.data.country);
    };

    init();
  }, [token]);

  // 🚀 Enviar nuevas fotos
  const onSubmit = async (values) => {
    const data = new FormData();
    data.append("email", email);
    data.append("story", values.story);
    data.append("year", values.year);
    data.append("title", values.title);
    Array.from(values.photos).forEach(f =>
      data.append("photos", f)
    );

    await axios.post(`${API}/emails/add-photos`, data);
    alert("Fotos añadidas 💛");
  };

  if (!lockedData) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Subir otra foto</h2>

      {/* 🔒 BLOQUEADOS */}
      <input value={email} disabled />
      <input {...register("name")} disabled />
      <input {...register("age")} disabled />

      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <ReactFlagsSelect {...field} disabled />
        )}
      />

      {/* ✏️ EDITABLES */}
      <textarea {...register("story")} placeholder="Historia" />
      <input {...register("year")} placeholder="Año" />
      <input {...register("title")} placeholder="Título" />

      <input
        type="file"
        multiple
        {...register("photos")}
      />

      <button type="submit">Subir fotos</button>
    </form>
  );
}

export default AddPhotos;
