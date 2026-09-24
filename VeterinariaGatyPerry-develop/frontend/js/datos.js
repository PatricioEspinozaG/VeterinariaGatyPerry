const VeterinariaDatos = (() => {
    const servicios = [
        { codigo: "SV001", categoria: "Consultas", nombre: "Consulta general", especie: "Perro / Gato", duracion: "30 min", precio: 15000, observacion: "" },
        { codigo: "SV002", categoria: "Consultas", nombre: "Consulta urgencia", especie: "Perro / Gato", duracion: "30 min", precio: 25000, observacion: "Fuera de horario +$10.000" },
        { codigo: "SV003", categoria: "Consultas", nombre: "Control postoperatorio", especie: "Perro / Gato", duracion: "20 min", precio: 10000, observacion: "" },
        { codigo: "SV004", categoria: "Consultas", nombre: "Consulta ave / conejo", especie: "Ave / Conejo", duracion: "30 min", precio: 18000, observacion: "" },
        { codigo: "SV005", categoria: "Consultas", nombre: "Segunda opinión médica", especie: "Todas", duracion: "40 min", precio: 20000, observacion: "Requiere ficha previa" },
        { codigo: "VA001", categoria: "Vacunación", nombre: "Vacuna antirrábica canina", especie: "Perro", duracion: "10 min", precio: 12000, observacion: "Obligatoria por ley" },
        { codigo: "VA002", categoria: "Vacunación", nombre: "Vacuna séxtuple canina", especie: "Perro", duracion: "10 min", precio: 18000, observacion: "Refuerzo anual" },
        { codigo: "VA003", categoria: "Vacunación", nombre: "Vacuna bivalente felina", especie: "Gato", duracion: "10 min", precio: 15000, observacion: "Refuerzo anual" },
        { codigo: "VA004", categoria: "Vacunación", nombre: "Vacuna triple felina", especie: "Gato", duracion: "10 min", precio: 17000, observacion: "Refuerzo anual" },
        { codigo: "VA005", categoria: "Vacunación", nombre: "Vacuna Bordetella canina", especie: "Perro", duracion: "10 min", precio: 14000, observacion: "Tos de las perreras" },
        { codigo: "VA006", categoria: "Vacunación", nombre: "Vacuna antirrábica felina", especie: "Gato", duracion: "10 min", precio: 12000, observacion: "" },
        { codigo: "CI001", categoria: "Cirugía", nombre: "Esterilización hembra canina", especie: "Perra", duracion: "90 min", precio: 80000, observacion: "Incluye anestesia y hospitalización 24 h" },
        { codigo: "CI002", categoria: "Cirugía", nombre: "Esterilización macho canino", especie: "Perro", duracion: "60 min", precio: 60000, observacion: "Incluye anestesia" },
        { codigo: "CI003", categoria: "Cirugía", nombre: "Esterilización hembra felina", especie: "Gata", duracion: "60 min", precio: 65000, observacion: "Incluye anestesia y hospitalización 12 h" },
        { codigo: "CI004", categoria: "Cirugía", nombre: "Esterilización macho felino", especie: "Gato", duracion: "45 min", precio: 50000, observacion: "Incluye anestesia" },
        { codigo: "CI005", categoria: "Cirugía", nombre: "Extirpación de tumor cutáneo", especie: "Perro / Gato", duracion: "60 min", precio: 120000, observacion: "Valor referencial" },
        { codigo: "CI006", categoria: "Cirugía", nombre: "Cesárea de urgencia", especie: "Perra / Gata", duracion: "120 min", precio: 180000, observacion: "" },
        { codigo: "DE001", categoria: "Desparasitación", nombre: "Desparasitación interna pequeños (<10 kg)", especie: "Perro", duracion: "5 min", precio: 8000, observacion: "" },
        { codigo: "DE002", categoria: "Desparasitación", nombre: "Desparasitación interna medianos (10-25 kg)", especie: "Perro", duracion: "5 min", precio: 9500, observacion: "" },
        { codigo: "DE003", categoria: "Desparasitación", nombre: "Desparasitación interna grandes (>25 kg)", especie: "Perro", duracion: "5 min", precio: 11000, observacion: "" },
        { codigo: "DE004", categoria: "Desparasitación", nombre: "Desparasitación interna felina", especie: "Gato", duracion: "5 min", precio: 8000, observacion: "" },
        { codigo: "DE005", categoria: "Desparasitación", nombre: "Antiparasitario externo (pipeta)", especie: "Perro / Gato", duracion: "5 min", precio: 7500, observacion: "Incluye aplicación" },
        { codigo: "EX001", categoria: "Exámenes", nombre: "Hemograma completo", especie: "Perro / Gato", duracion: "30 min", precio: 22000, observacion: "Resultado en 24-48 h" },
        { codigo: "EX002", categoria: "Exámenes", nombre: "Perfil bioquímico completo", especie: "Perro / Gato", duracion: "30 min", precio: 35000, observacion: "Resultado en 24-48 h" },
        { codigo: "EX003", categoria: "Exámenes", nombre: "Radiografía (1 proyección)", especie: "Perro / Gato", duracion: "20 min", precio: 28000, observacion: "" },
        { codigo: "EX004", categoria: "Exámenes", nombre: "Ecografía abdominal", especie: "Perro / Gato", duracion: "30 min", precio: 45000, observacion: "" },
        { codigo: "EX005", categoria: "Exámenes", nombre: "Test de leishmaniasis", especie: "Perro", duracion: "20 min", precio: 18000, observacion: "" },
        { codigo: "OT001", categoria: "Otros", nombre: "Corte de uñas", especie: "Perro / Gato", duracion: "15 min", precio: 5000, observacion: "" },
        { codigo: "OT002", categoria: "Otros", nombre: "Limpieza dental", especie: "Perro / Gato", duracion: "45 min", precio: 55000, observacion: "Requiere anestesia" },
        { codigo: "OT003", categoria: "Otros", nombre: "Microchip de identificación", especie: "Perro / Gato", duracion: "10 min", precio: 15000, observacion: "Incluye registro" },
        { codigo: "OT004", categoria: "Otros", nombre: "Hospitalización (por día)", especie: "Perro / Gato", duracion: "24 h", precio: 30000, observacion: "Incluye monitoreo y alimentación básica" }
    ];

    const productos = [
        ["ME001", "Antibióticos", "Amoxibay 250 mg", "Amoxicilina", "Blíster 10 comp.", "Perro / Gato", 45, 4200, 10],
        ["ME002", "Antibióticos", "Enrox 50 mg", "Enrofloxacino", "Blíster 10 comp.", "Perro / Gato", 30, 6800, 8],
        ["ME003", "Antibióticos", "Metrobay 250 mg", "Metronidazol", "Blíster 10 comp.", "Perro / Gato", 28, 3900, 8],
        ["ME004", "Antiparasitarios", "Nexgard", "Afoxolaner", "Masticable 1 unid.", "Perro", 60, 9500, 15],
        ["ME005", "Antiparasitarios", "Bravecto", "Fluralaner", "Masticable 1 unid.", "Perro", 40, 18900, 10],
        ["ME006", "Antiparasitarios", "Revolution Plus", "Selamectina + Sarolaner", "Pipeta 1 unid.", "Gato", 35, 14500, 8],
        ["ME007", "Antiparasitarios", "Drontal Plus", "Praziquantel + Pamoato", "Comprimido 1 unid.", "Perro", 80, 3200, 20],
        ["ME008", "Antiparasitarios", "Milbemax Gato", "Milbemicina + Praziquantel", "Comprimido 2 unid.", "Gato", 50, 6800, 12],
        ["ME009", "Antiinflamatorios", "Meloxicam 1 mg", "Meloxicam", "Blíster 10 comp.", "Perro / Gato", 55, 4500, 12],
        ["ME010", "Antiinflamatorios", "Carprofen 50 mg", "Carprofeno", "Blíster 10 comp.", "Perro", 30, 9800, 8],
        ["ME011", "Dermatología", "Clorhexidina shampoo", "Clorhexidina 2%", "Frasco 250 ml", "Perro / Gato", 25, 8900, 6],
        ["ME012", "Dermatología", "Malaseb shampoo", "Miconazol + Clorhexidina", "Frasco 250 ml", "Perro / Gato", 20, 12500, 6],
        ["ME013", "Dermatología", "Apoquel 16 mg", "Oclacitinib", "Blíster 10 comp.", "Perro", 18, 22000, 6],
        ["ME014", "Digestivo", "Probifor", "Bacillus clausii", "Sobre 5 ml x10", "Perro / Gato", 40, 5600, 10],
        ["ME015", "Digestivo", "Omeprazol 10 mg vet", "Omeprazol", "Blíster 10 comp.", "Perro / Gato", 35, 3800, 9],
        ["ME016", "Cardíaco", "Vetmedin 2.5 mg", "Pimobendan", "Blíster 10 comp.", "Perro", 15, 28000, 5],
        ["ME017", "Analgésicos", "Tramadol 50 mg vet", "Tramadol", "Blíster 10 comp.", "Perro", 22, 5200, 6],
        ["ME018", "Vacunas", "Nobivac DHPPi", "Vacuna polivalente", "Vial 1 dosis", "Perro", 48, 8500, 12],
        ["ME019", "Vacunas", "Nobivac Rabies", "Vacuna antirrábica", "Vial 1 dosis", "Perro / Gato", 60, 5800, 15],
        ["ME020", "Vacunas", "Felocell CVR", "Vacuna triple felina", "Vial 1 dosis", "Gato", 36, 7200, 10],
        ["ME021", "Suplementos", "Omega vet 3-6-9", "Ácidos grasos omega", "Frasco 100 ml", "Perro / Gato", 30, 9900, 8],
        ["ME022", "Suplementos", "Condrovet forte", "Condroitín + Glucosamina", "Blíster 30 comp.", "Perro", 25, 14500, 7]
    ].map(item => ({
        codigo: item[0], categoria: item[1], nombre: item[2], principioActivo: item[3],
        presentacion: item[4], especie: item[5], stock: item[6], precio: item[7], stockCritico: item[8]
    }));

    const articulos = [
        { id: 1, titulo: "Calendario de vacunas para perros", resumen: "Qué vacunas necesita tu perro y cuándo corresponde cada refuerzo.", contenido: "La vacunación protege a tu perro y a la comunidad. El plan comienza durante las primeras semanas de vida y continúa con los refuerzos indicados por el médico veterinario. La edad, el estado de salud y el estilo de vida pueden modificar el calendario. Guarda cada fecha y agenda el control antes del vencimiento." },
        { id: 2, titulo: "Señales para consultar a tiempo", resumen: "Cambios de apetito, energía y conducta que conviene observar.", contenido: "Una baja persistente del apetito, vómitos repetidos, dificultad para respirar, dolor evidente o cambios bruscos de conducta justifican una evaluación profesional. No automediques a tu mascota: varios medicamentos humanos son tóxicos para perros y gatos." },
        { id: 3, titulo: "Control preventivo en gatos", resumen: "Los gatos esconden molestias: un control periódico ayuda a detectarlas.", contenido: "Los controles preventivos permiten revisar peso, boca, piel, vacunación y desparasitación. En gatos adultos y mayores, el veterinario puede recomendar exámenes según su edad y antecedentes. Una transportadora familiar y una visita tranquila reducen el estrés." }
    ];

    const regiones = {
        "O'Higgins": ["Rancagua", "Machalí", "Graneros", "San Fernando"],
        "Valparaíso": ["Viña del Mar", "Valparaíso", "Quilpué", "Villa Alemana"],
        "Metropolitana": ["Santiago", "Providencia", "Maipú", "Puente Alto"]
    };

    return { servicios, productos, articulos, regiones };
})();
