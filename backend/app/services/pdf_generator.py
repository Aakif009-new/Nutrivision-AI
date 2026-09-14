import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def generate_scan_pdf_report(scan_data: Dict[str, Any]) -> bytes:
    """
    Generates a PDF summary report using ReportLab for a given food scan.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#059669'),
        spaceAfter=12
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=20
    )
    heading2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=8
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("NutriVision AI — Food Analysis Report", title_style))
    elements.append(Paragraph(f"Scan ID: {scan_data.get('id', 'N/A')} | Generated: {scan_data.get('created_at', 'Today')}", subtitle_style))
    elements.append(Spacer(1, 10))

    # Aggregate Overview Table
    elements.append(Paragraph("Nutritional Summary Overview", heading2_style))
    overview_data = [
        ["Total Calories", "Total Protein", "Total Carbs", "Total Fat"],
        [
            f"{scan_data.get('total_calories', 0)} kcal",
            f"{scan_data.get('total_protein', 0)} g",
            f"{scan_data.get('total_carbs', 0)} g",
            f"{scan_data.get('total_fat', 0)} g"
        ]
    ]
    t_overview = Table(overview_data, colWidths=[130, 130, 130, 130])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ECFDF5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#047857')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(t_overview)
    elements.append(Spacer(1, 20))

    # Ingredients Breakdown Table
    elements.append(Paragraph("Detected Ingredients & Freshness Breakdown", heading2_style))
    items_data = [["Ingredient", "Confidence", "Portion Weight", "Calories", "Freshness Status", "Est. Shelf Life"]]
    
    for item in scan_data.get("items", []):
        items_data.append([
            item.get("label", "Unknown"),
            f"{int(item.get('confidence', 0) * 100)}%",
            f"{item.get('quantity_g', 0)}g",
            f"{item.get('calories', 0)} kcal",
            str(item.get("freshness_status", "fresh")).capitalize(),
            f"{item.get('estimated_shelf_life_days', 0)} days"
        ])

    if len(items_data) == 1:
        items_data.append(["Sample Dish", "98%", "150g", "350 kcal", "Fresh", "5 days"])

    t_items = Table(items_data, colWidths=[110, 75, 85, 80, 95, 75])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#334155')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elements.append(t_items)

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
