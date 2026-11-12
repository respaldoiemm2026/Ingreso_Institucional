import { resumenDelDiaService } from "../services/reporte.service.js";
import { parseFecha } from "../utils/fechas.js";

export const controllerResumen = async (req, res) => {
    const fecha = req.query.fecha ? parseFecha(req.query.fecha) : undefined;
    res.status(200).json(await resumenDelDiaService(fecha));
};
