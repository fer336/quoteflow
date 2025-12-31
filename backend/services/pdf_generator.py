from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from io import BytesIO
from datetime import datetime
import os

def create_budget_pdf(budget):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    
    story = []
    styles = getSampleStyleSheet()
    
    # --- Estilos Personalizados ---
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#16a34a'), # Primary green
        spaceAfter=12,
        alignment=1 # Center
    )
    
    # --- Logo / Encabezado ---
    # Buscamos el logo en la carpeta static
    logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "logo.png")
    
    if os.path.exists(logo_path):
        # Si existe el logo, lo agregamos
        try:
            # Calculamos dimensiones para ajustar al ancho (max 17cm ancho, max 5cm alto)
            available_width = 17 * cm
            img = Image(logo_path)
            
            # Obtener tamaño original
            img_width = img.drawWidth
            img_height = img.drawHeight
            
            # Mantener aspecto
            aspect = img_height / float(img_width)
            display_width = available_width
            display_height = display_width * aspect
            
            # Si es muy alto, limitamos la altura
            if display_height > 5*cm:
                display_height = 5*cm
                display_width = display_height / aspect
            
            img.drawHeight = display_height
            img.drawWidth = display_width
            img.hAlign = 'CENTER'
            
            story.append(img)
            story.append(Spacer(1, 0.5*cm))
        except Exception as e:
            print(f"Error cargando logo: {e}")
            story.append(Paragraph("PRESUPUESTO", title_style))
    else:
        # Si no hay logo, mostramos título estándar y datos de ejemplo
        story.append(Paragraph("PRESUPUESTO", title_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Datos de la empresa (Solo si no hay logo)
        company_info = [
            ["BudgetPro Inc."],
            ["contacto@budgetpro.com"]
        ]
        t_company = Table(company_info, colWidths=[17*cm])
        t_company.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.gray),
        ]))
        story.append(t_company)
        story.append(Spacer(1, 0.5*cm))
    
    # --- Datos del Presupuesto y Cliente ---
    budget_date = budget.date.strftime("%d/%m/%Y")
    
    # Título de sección
    story.append(Paragraph(f"Presupuesto N°: {budget.budget_id}", 
                 ParagraphStyle('SubTitle', parent=styles['Heading2'], alignment=1, spaceAfter=10)))
    
    budget_info_data = [
        ["Cliente:", budget.client, "Fecha:", budget_date],
        ["Validez:", budget.validity, "Estado:", budget.status.value]
    ]
    
    # Tabla de info
    t_info = Table(budget_info_data, colWidths=[2.5*cm, 6*cm, 2.5*cm, 6*cm])
    t_info.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'), # Etiquetas en negrita
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),       # Valores normal
        ('FONTNAME', (3,0), (3,-1), 'Helvetica'),       # Valores normal
        ('TEXTCOLOR', (0,0), (-1,-1), colors.darkslategray),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 1*cm))
    
    # --- Tabla de Items ---
    data = [['Descripción', 'Monto']]
    
    for item in budget.items:
        data.append([item.description, f"${item.amount:,.2f}"])
    
    # Total
    data.append(['', '']) # Espacio
    data.append(['TOTAL', f"${budget.total:,.2f}"])
    
    # Estilo de tabla de items
    t_items = Table(data, colWidths=[13*cm, 4*cm])
    t_items.setStyle(TableStyle([
        # Encabezado
        ('BACKGROUND', (0,0), (1,0), colors.HexColor('#16a34a')),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('ALIGN', (0,0), (1,0), 'CENTER'),
        ('FONTNAME', (0,0), (1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (1,0), 12),
        ('BOTTOMPADDING', (0,0), (1,0), 12),
        ('TOPPADDING', (0,0), (1,0), 12),
        
        # Cuerpo
        ('BACKGROUND', (0,1), (-1,-3), colors.whitesmoke),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
        ('ALIGN', (1,1), (1,-1), 'RIGHT'), # Montos a la derecha
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('GRID', (0,0), (-1,-3), 0.5, colors.lightgrey),
        
        # Fila Total
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 14),
        ('TEXTCOLOR', (0,-1), (-1,-1), colors.HexColor('#16a34a')),
        ('TOPPADDING', (0,-1), (-1,-1), 12),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.HexColor('#16a34a')),
        ('ALIGN', (0,-1), (0,-1), 'RIGHT'),
    ]))
    
    story.append(t_items)
    story.append(Spacer(1, 2*cm))
    
    # --- Pie de página ---
    footer_text = "Gracias por su confianza."
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], alignment=1, fontSize=8, textColor=colors.gray)))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
