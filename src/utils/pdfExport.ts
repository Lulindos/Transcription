import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TranslationData {
  eventName: string;
  date: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  duration: string;
}

export const generatePDF = async (data: TranslationData): Promise<void> => {
  // Create a new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add background color and styling
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add header with logo and title
  pdf.setFillColor(255, 94, 58);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  // Add title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('Translation Report', pageWidth / 2, 15, { align: 'center' });
  
  // Add event information
  pdf.setTextColor(70, 70, 70);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(data.eventName, 20, 40);
  
  // Add date and duration
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(`Date: ${data.date}`, 20, 50);
  pdf.text(`Duration: ${data.duration}`, 20, 57);
  
  // Add language information
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(20, 65, pageWidth - 40, 20, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`From: ${data.sourceLanguage}`, 25, 75);
  pdf.text(`To: ${data.targetLanguage}`, pageWidth - 25, 75, { align: 'right' });
  
  // Add divider
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 90, pageWidth - 20, 90);
  
  // Add original text section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Original Text', 20, 100);
  
  // Add original text content with word wrapping
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  const originalTextLines = pdf.splitTextToSize(data.originalText, pageWidth - 40);
  pdf.text(originalTextLines, 20, 110);
  
  // Calculate position for translated text section
  const originalTextHeight = originalTextLines.length * 7;
  const translatedTextY = 120 + originalTextHeight;
  
  // Add translated text section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Translated Text', 20, translatedTextY);
  
  // Add translated text content with word wrapping
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  const translatedTextLines = pdf.splitTextToSize(data.translatedText, pageWidth - 40);
  pdf.text(translatedTextLines, 20, translatedTextY + 10);
  
  // Add footer
  const footerY = pageHeight - 10;
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Generated by Audio Translator App', pageWidth / 2, footerY, { align: 'center' });
  
  // Save the PDF
  pdf.save(`translation-${data.eventName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Function to create a more visually appealing PDF with a modern, refined workbook style
export const generateBeautifulPDF = async (data: TranslationData): Promise<void> => {
  // Create a temporary HTML element to render our beautiful design
  const container = document.createElement('div');
  container.style.width = '794px'; // A4 width in pixels at 96 DPI
  container.style.height = '1123px'; // A4 height in pixels at 96 DPI
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.fontFamily = '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  
  // Set the inner HTML with our beautiful modern workbook design
  container.innerHTML = `
    <div style="width: 100%; height: 100%; background: #ffffff; padding: 0; box-sizing: border-box; position: relative; overflow: hidden; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <!-- Modern cover design with gradient sidebar -->
      <div style="position: absolute; top: 0; left: 0; width: 180px; height: 100%; background: linear-gradient(to bottom, #ff5e3a, #ff2d55); z-index: 1;"></div>
      
      <!-- White overlay with shadow for main content -->
      <div style="position: absolute; top: 0; left: 150px; width: calc(100% - 150px); height: 100%; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1); z-index: 2;"></div>
      
      <!-- Sidebar content -->
      <div style="position: absolute; top: 50px; left: 25px; width: 130px; z-index: 3; text-align: center;">
        <div style="color: white; margin-bottom: 40px;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; opacity: 0.9;">Translation</div>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">WORKBOOK</div>
          <div style="width: 40px; height: 3px; background: white; margin: 15px auto; opacity: 0.7;"></div>
        </div>
        
        <!-- Language badges -->
        <div style="margin-bottom: 20px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 15px; display: flex; justify-content: center; align-items: center; font-size: 18px; font-weight: bold; color: white; border: 2px solid white;">
            ${data.sourceLanguage.substring(0, 2).toUpperCase()}
          </div>
          <div style="color: white; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Source</div>
        </div>
        
        <div style="color: white; font-size: 20px; margin: 15px 0;">→</div>
        
        <div style="margin-bottom: 40px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 15px; display: flex; justify-content: center; align-items: center; font-size: 18px; font-weight: bold; color: white; border: 2px solid white;">
            ${data.targetLanguage.substring(0, 2).toUpperCase()}
          </div>
          <div style="color: white; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Target</div>
        </div>
        
        <!-- Event details -->
        <div style="color: white; margin-top: 60px; text-align: left; padding: 0 10px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 5px;">Event</div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 20px; line-height: 1.4;">${data.eventName}</div>
          
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 5px;">Date</div>
          <div style="font-size: 14px; margin-bottom: 20px;">${data.date}</div>
          
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 5px;">Duration</div>
          <div style="font-size: 14px;">${data.duration}</div>
        </div>
      </div>
      
      <!-- Main content area -->
      <div style="position: absolute; top: 0; left: 180px; width: calc(100% - 180px); height: 100%; padding: 50px 40px; box-sizing: border-box; z-index: 3; overflow: hidden;">
        <!-- Modern header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
          <div>
            <div style="font-size: 28px; font-weight: 300; color: #333; letter-spacing: -0.5px;">Translation Document</div>
            <div style="width: 50px; height: 3px; background: #ff5e3a; margin-top: 10px;"></div>
          </div>
          
          <!-- Modern page indicator -->
          <div style="display: flex; align-items: center; color: #999;">
            <div style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #eee; display: flex; justify-content: center; align-items: center; margin-right: 10px; font-weight: bold; color: #ff5e3a;">1</div>
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Page</div>
          </div>
        </div>
        
        <!-- Content sections with modern styling -->
        <div style="margin-bottom: 40px;">
          <!-- Original Text Section -->
          <div style="margin-bottom: 40px;">
            <div style="margin-bottom: 15px;">
              <div style="display: inline-block; background: #f8f8f8; border-left: 3px solid #ff5e3a; padding: 8px 15px;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 2px;">Original Text</div>
                <div style="font-size: 16px; font-weight: 600; color: #333;">${data.sourceLanguage}</div>
              </div>
            </div>
            
            <div style="background: white; border: 1px solid #eee; border-radius: 5px; padding: 25px; position: relative; box-shadow: 0 3px 10px rgba(0,0,0,0.03);">
              <!-- Modern subtle background pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: 
                radial-gradient(circle, #f0f0f0 1px, transparent 1px); 
                background-size: 20px 20px; 
                opacity: 0.3; 
                pointer-events: none;"></div>
                
              <!-- Text content with modern typography -->
              <div style="position: relative; z-index: 2; color: #444; font-size: 16px; line-height: 1.7; white-space: pre-wrap; font-weight: 400;">${data.originalText}</div>
              
              <!-- Decorative element -->
              <div style="position: absolute; bottom: 15px; right: 15px; width: 30px; height: 30px; border-radius: 50%; background: #ff5e3a; opacity: 0.1;"></div>
            </div>
          </div>
          
          <!-- Translated Text Section -->
          <div>
            <div style="margin-bottom: 15px;">
              <div style="display: inline-block; background: #f8f8f8; border-left: 3px solid #ff5e3a; padding: 8px 15px;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 2px;">Translated Text</div>
                <div style="font-size: 16px; font-weight: 600; color: #333;">${data.targetLanguage}</div>
              </div>
            </div>
            
            <div style="background: white; border: 1px solid #eee; border-radius: 5px; padding: 25px; position: relative; box-shadow: 0 3px 10px rgba(0,0,0,0.03);">
              <!-- Modern subtle background pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: 
                radial-gradient(circle, #f0f0f0 1px, transparent 1px); 
                background-size: 20px 20px; 
                opacity: 0.3; 
                pointer-events: none;"></div>
                
              <!-- Text content with modern typography -->
              <div style="position: relative; z-index: 2; color: #444; font-size: 16px; line-height: 1.7; white-space: pre-wrap; font-weight: 400;">${data.translatedText}</div>
              
              <!-- Decorative element -->
              <div style="position: absolute; bottom: 15px; right: 15px; width: 30px; height: 30px; border-radius: 50%; background: #ff5e3a; opacity: 0.1;"></div>
            </div>
          </div>
        </div>
        
        <!-- Modern notes section -->
        <div style="margin-top: 50px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #ff5e3a; margin-right: 10px; display: flex; justify-content: center; align-items: center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div style="font-size: 16px; font-weight: 600; color: #333;">Notes & Comments</div>
          </div>
          
          <div style="background: #f9f9f9; border-radius: 5px; padding: 20px; min-height: 100px; position: relative;">
            <!-- Subtle lined background -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(#e5e5e5 1px, transparent 1px); background-size: 100% 28px; opacity: 0.3; pointer-events: none;"></div>
            
            <!-- Placeholder text -->
            <div style="position: relative; z-index: 2; color: #bbb; font-style: italic; font-size: 14px;">Add your notes here...</div>
          </div>
        </div>
        
        <!-- Modern footer -->
        <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; display: flex; justify-content: space-between; align-items: center; color: #999; font-size: 12px;">
          <div>Generated by Audio Translator App</div>
          <div>${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      
      <!-- Modern decorative elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; border: 2px solid #f0f0f0; z-index: 4;"></div>
      <div style="position: absolute; top: 30px; right: 30px; width: 20px; height: 20px; border-radius: 50%; background: #ff5e3a; opacity: 0.2; z-index: 4;"></div>
      <div style="position: absolute; bottom: 40px; right: 60px; width: 60px; height: 60px; border-radius: 50%; border: 3px solid #f8f8f8; z-index: 4;"></div>
    </div>
  `;
  
  // Add the container to the document
  document.body.appendChild(container);
  
  try {
    // Use html2canvas to convert the HTML to an image
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: null
    });
    
    // Create a new PDF with the image
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`translation-document-${data.eventName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
