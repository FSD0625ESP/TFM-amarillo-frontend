import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import "./UserRegistration.css";
import ReactFlagsSelect from "react-flags-select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

const shareUrl = "https://tusitiooficial.com";
const title = "¡Acabo de subir mi foto al Proyecto Amarillo 💛!";
const START_YEAR = 1882;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, idx) => CURRENT_YEAR - idx
);

const formSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  age: z
    .coerce.number({ invalid_type_error: "La edad debe ser numérica." })
    .int()
    .min(1, "La edad debe ser un número entre 1 y 115.")
    .max(115, "La edad debe ser un número entre 1 y 115."),
  country: z.string().min(1, "Selecciona un país de la lista."),
  story: z.string().trim().min(1, "La historia es obligatoria."),
  year: z
    .coerce.number({ invalid_type_error: "El año debe ser numérico." })
    .int()
    .min(
      START_YEAR,
      `El año de la foto debe ser un número entre ${START_YEAR} y ${CURRENT_YEAR}.`
    )
    .max(
      CURRENT_YEAR,
      `El año de la foto debe ser un número entre ${START_YEAR} y ${CURRENT_YEAR}.`
    ),
  title: z.string().trim().min(1, "El título es obligatorio."),
  photos: z
    .any()
    .refine(
      (value) => value && value.length > 0,
      "Debes adjuntar al menos una fotografía."
    ),
});

Modal.setAppElement("#root");

function UserRegistration() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    formState: { errors, touchedFields, isSubmitted },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      age: "",
      country: "",
      story: "",
      year: "",
      title: "",
      photos: [],
    },
  });
  const nameWatch = watch("name");

  // 🔍 Verificar token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/emails/verify-token?token=${token}`
        );
        setEmail(res.data.email);
        if (res.data.email) {
          localStorage.setItem("verifiedEmail", res.data.email.toLowerCase());
        }
        if (res.data.token) {
          localStorage.setItem("userToken", res.data.token);
        }
        if (res.data.userId && res.data.email) {
          const userData = { _id: res.data.userId, email: res.data.email };
          if (res.data?.country) {
            userData.country = res.data.country;
          }
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        setVerified(true);
      } catch {
        setMessage("El enlace ha expirado o no es válido.");
      }
    };
    verifyToken();
  }, [token]);

  // ✏️ Manejar inputs
  const handlePhotosChange = (e) => {
    const files = e.target.files || [];
    setValue("photos", files, { shouldValidate: true, shouldTouch: true });
    clearErrors("photos");
  };

  const blockNonNumericKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // 🚀 Enviar formulario
  const onSubmit = async (formValues) => {
    setMessage("");
    setLoading(true);

    const data = new FormData();
    data.append("email", email); // 👈 owner de la foto
    data.append("name", formValues.name.trim());
    data.append("age", Number(formValues.age));
    data.append("country", formValues.country); // código de país seleccionado
    data.append("story", formValues.story.trim());
    data.append("year", Number(formValues.year));
    data.append("title", formValues.title.trim());
    Array.from(formValues.photos).forEach((file) => data.append("photos", file));

    try {
      const res = await axios.post(
        "http://localhost:3000/emails/complete",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.token) {
        localStorage.setItem("userToken", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("userData", JSON.stringify(res.data.user));
      }
      setMessage(res.data.message || "Foto subida correctamente.");
      setModalOpen(true);
      reset();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Error al subir la fotografía."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!verified) return <p>{message || "Verificando enlace..."}</p>;

  return (
    <div className="registro-container">
      <h2>Completa tu registro</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="email" value={email} disabled />

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          {...register("name")}
          required
        />
        {errors.name && (isSubmitted || touchedFields.name) && (
          <span className="error">{errors.name.message}</span>
        )}
        <input
          type="number"
          name="age"
          placeholder="Edad"
          min="1"
          max="115"
          step="1"
          inputMode="numeric"
          pattern="[0-9]*"
          onKeyDown={blockNonNumericKeys}
          onWheel={(e) => e.preventDefault()}
          {...register("age")}
          required
        />
        {errors.age && (isSubmitted || touchedFields.age) && (
          <span className="error">{errors.age.message}</span>
        )}
        <div className="flag-select-wrapper">
          <Controller
            name="country"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ReactFlagsSelect
                searchable
                selected={value}
                onSelect={(code) => {
                  clearErrors("country");
                  onChange(code);
                }}
                placeholder="Selecciona tu país"
              />
            )}
          />
        </div>
        {errors.country && (isSubmitted || touchedFields.country) && (
          <span className="error">{errors.country.message}</span>
        )}
        <textarea
          name="story"
          placeholder="Cuéntanos tu historia"
          {...register("story")}
          required
        ></textarea>
        {errors.story && (isSubmitted || touchedFields.story) && (
          <span className="error">{errors.story.message}</span>
        )}

        <select
          name="year"
          className="year-picker"
          {...register("year")}
          required
        >
          <option value="" disabled>
            Año de la foto (desde 1882)
          </option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.year && (isSubmitted || touchedFields.year) && (
          <span className="error">{errors.year.message}</span>
        )}
        <input
          type="text"
          name="title"
          placeholder="Título de la foto"
          {...register("title")}
          required
        />
        {errors.title && (isSubmitted || touchedFields.title) && (
          <span className="error">{errors.title.message}</span>
        )}
        <input
          type="file"
          name="photos"
          accept="image/*"
        onChange={handlePhotosChange}
          required
        />
        {errors.photos && (isSubmitted || touchedFields.photos) && (
          <span className="error">{errors.photos.message}</span>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Registrar"}
        </button>
      </form>

      {message && <p className="mensaje">{message}</p>}

      {/* ✅ Modal de confirmación */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Registro Completo"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>🎉 ¡Felicidades, {nameWatch}! 🎉</h2>
        <p>
          Tu foto ha sido añadida al mosaico colaborativo de la Sagrada Família.
        </p>
        <p className="success-subtext">
          Gracias por formar parte de este homenaje colectivo 💛
        </p>

        {/* 🌍 Botones de compartir */}
        <div className="share-container">
          <FacebookShareButton url={shareUrl} quote={title}>
            <FacebookIcon size={40} round />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={title}>
            <TwitterIcon size={40} round />
          </TwitterShareButton>
          <WhatsappShareButton url={shareUrl} title={title}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>
        </div>

        <div className="modal-buttons">
          <button onClick={() => (window.location.href = "/home")}>
            Ver mosaico
          </button>
          <button onClick={() => (window.location.href = "/UserPage")}>
            Ver mis fotos
          </button>
          <button onClick={() => setModalOpen(false)}>Cerrar</button>
        </div>
      </Modal>
    </div>
  );
}

export default UserRegistration;
