from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from io import BytesIO
from datetime import datetime
import os
from services import storage

def create_budget_pdf(budget, client_data=None):
    buffer = BytesIO()
    # Márgenes ajustados: Top reducido a 1cm para subir todo
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=1*cm, bottomMargin=2*cm)
    
    story = []
    styles = getSampleStyleSheet()
    
    # --- Definición de Colores ---
    PRIMARY_COLOR = colors.HexColor('#1e40af') # Azul Profesional
    
    # --- Estilos Personalizados ---
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=12,
        alignment=1 # Center
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica-Bold',
        textColor=colors.black
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        textColor=colors.black
    )
    
    # --- Logo ---
    try:
        # Intentar obtener logo de MinIO si el usuario tiene uno configurado
        logo_content = None
        if budget.user and budget.user.logo_url:
            logo_content = storage.get_file_content(budget.user.logo_url)
        
        if logo_content:
            logo_io = BytesIO(logo_content)
            img = Image(logo_io)
            
            img_width = img.drawWidth
            img_height = img.drawHeight
            aspect = img_height / float(img_width)
            
            # Max 5cm ancho x 1.5cm alto (Más pequeño y sutil)
            max_width = 5 * cm
            max_height = 1.5 * cm
            
            display_width = max_width
            display_height = display_width * aspect
            
            if display_height > max_height:
                display_height = max_height
                display_width = display_height / aspect
            
            img.drawHeight = display_height
            img.drawWidth = display_width
            img.hAlign = 'CENTER'
            
            story.append(img)
            story.append(Spacer(1, 0.1*cm)) # Espacio reducido tras logo
    except Exception as e:
        print(f"Error cargando logo: {e}")
    
    # --- Título Principal ---
    # Tamaño ajustado para uniformidad (fontSize=11, spaceAfter reducido)
    story.append(Paragraph(f"PRESUPUESTO Nº: {budget.budget_id}", 
                 ParagraphStyle('BudgetTitle', parent=styles['Heading2'], alignment=1, spaceAfter=8, fontSize=11, fontName='Helvetica-Bold', textColor=colors.black)))
    
    # --- Datos del Cliente y Presupuesto ---
    budget_date = budget.date.strftime("%d/%m/%Y")
    client_phone = client_data.phone if client_data and client_data.phone else "-"
    client_email = client_data.email if client_data and client_data.email else "-"
    
    # Datos organizados para que coincidan con el diseño
    # Fila 1: Cliente | Fecha
    # Fila 2: Teléfono | Validez
    # Fila 3: Email    | Estado
    
    # Función helper para formatear pares Clave: Valor
    def row_pair(label1, val1, label2, val2):
        return [
            Paragraph(f"<b>{label1}</b> {val1}", styles['Normal']),
            Paragraph(f"<b>{label2}</b> {val2}", styles['Normal'])
        ]

    info_data = [
        row_pair("Cliente:", budget.client, "Fecha:", budget_date),
        row_pair("Teléfono:", client_phone, "Validez:", budget.validity),
        row_pair("Email:", client_email, "Estado:", budget.status.value)
    ]
    
    t_info = Table(info_data, colWidths=[9*cm, 8*cm])
    t_info.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    
    story.append(t_info)
    story.append(Spacer(1, 0.5*cm))
    
    # --- Tabla de Items ---
    # Encabezados
    data = [[
        Paragraph('DESCRIPCIÓN DEL TRABAJO / MATERIALES', ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=10, textColor=colors.white, alignment=1)),
        Paragraph('SUBTOTAL', ParagraphStyle('TH_R', fontName='Helvetica-Bold', fontSize=10, textColor=colors.white, alignment=2))
    ]]
    
    # Filas de items
    for item in budget.items:
        # Si el monto es 0, mostramos vacío en lugar de $0.00
        amount_str = "" if item.amount == 0 else f"${item.amount:,.2f}"
        
        data.append([
            Paragraph(item.description, styles['Normal']),
            amount_str
        ])
    
    # Fila de Total (sin relleno de filas vacías)
    data.append([
        'TOTAL A PAGAR', 
        f"${budget.total:,.2f}"
    ])
    
    t_items = Table(data, colWidths=[13.5*cm, 3.5*cm])
    
    t_items.setStyle(TableStyle([
        # --- Encabezado ---
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        
        # --- Cuerpo ---
        ('BACKGROUND', (0,1), (-1,-2), colors.HexColor('#f8fafc')), # Gris muy claro
        ('GRID', (0,0), (-1,-2), 0.5, colors.lightgrey),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,1), (1,-1), 'RIGHT'), # Montos alineados derecha
        ('FONTNAME', (0,1), (-1,-2), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-2), 9),
        ('TOPPADDING', (0,1), (-1,-1), 6),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        
        # --- Fila Total ---
        ('TEXTCOLOR', (0,-1), (-1,-1), PRIMARY_COLOR),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 11),
        ('ALIGN', (0,-1), (0,-1), 'LEFT'),  # Label "TOTAL A PAGAR" a la izquierda
        ('ALIGN', (1,-1), (1,-1), 'RIGHT'), # Valor a la derecha
        ('TOPPADDING', (0,-1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 10),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, PRIMARY_COLOR), # Línea azul gruesa arriba del total
        ('LINEBELOW', (0,-1), (-1,-1), 1.5, PRIMARY_COLOR), # Línea azul gruesa abajo del total
    ]))
    
    story.append(t_items)
    
    doc.build(story)
    buffer.seek(0)
    return buffer
