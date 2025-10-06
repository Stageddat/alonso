export interface Item {
	id: string;
	name: string;
	url: string;
	property_tipo: string[];
	property_curso: string[];
	property_comentario: string;
	property_fecha_l_mite: { start: string; end: string | null; time_zone: string | null };
	property_url: string;
	property_completado: boolean;
	property_nombre: string;
}
