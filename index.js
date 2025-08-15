/**
 * Converts a number to its word representation.
 * @param {number} num The number to convert.
 * @returns {string} The word representation of the number.
 */
function ConvertNumberToWords(num) {
    if (num === 0) return "zero";

    const belowTwenty = [
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen"
    ];
    const tens = [
        "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
        "eighty", "ninety"
    ];
    const places = ["", "thousand", "lakh", "crore"];

    function helper(n) {
        if (n === 0) return "";
        else if (n < 20) return belowTwenty[n - 1] + " ";
        else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
        else return belowTwenty[Math.floor(n / 100) - 1] + " hundred " + (n % 100 !== 0 ? "and " : "") + helper(n % 100);
    }

    let integerPart = Math.floor(num);
    let decimalPart = num % 1;
    let word = "";
    let i = 0;

    while (integerPart > 0) {
        let chunk = integerPart % (i === 0 ? 1000 : 100);
        if (chunk !== 0) {
            word = helper(chunk) + places[i] + " " + word;
        }
        integerPart = Math.floor(integerPart / (i === 0 ? 1000 : 100));
        i++;
    }

    word = word.trim();

    if (decimalPart > 0) {
        let decimalWords = "point ";
        const decimals = decimalPart.toString().split(".")[1] || "";
        for (let digit of decimals) {
            decimalWords += (belowTwenty[parseInt(digit) - 1] || 'zero') + " ";
        }
        word += " " + decimalWords.trim();
    }

    return word.trim();
}

/**
 * Generates and downloads a PDF of the invoice.
 * @param {string} invoiceNumber The invoice number for the filename.
 */
function printInvoice(invoiceNumber) {
    // Add a 'print' class to the body for any print-specific styling
    document.body.classList.add("print");
    let invoiceElement = document.getElementById("main_formm");

    const options = {
        margin: 0.5,
        filename: `MS#${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // html2pdf returns a promise, allowing us to perform actions after it completes
    html2pdf().from(invoiceElement).set(options).save().then(() => {
        // This code runs AFTER the PDF has been saved.
        // We remove the 'print' class to restore the normal view.
        document.body.classList.remove("print");
    }).catch(err => {
        // If there's an error, log it and still remove the print class.
        console.error("PDF generation failed:", err);
        document.body.classList.remove("print");
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxAd4ZF3BfZcRomueGzf7QciFu2B6QKi_Rsn8Dld0zdLG7gOb4-vsAxLRzGFg1BuU-FcA/exec';
    const form = document.forms['google-sheet'];

    // --- Get all interactive elements ---
    const submitBtn = document.getElementById('but');
    const printBtn = document.getElementById('printBtn');
    const editBtn = document.getElementById('editBtn');
    const editBtnContainer = document.getElementById('editBtnContainer');
    const testDataBtn = document.getElementById('testDataBtn');
    
    // --- Get form and invoice sections ---
    const form_container = document.getElementById('form_container');
    const form_main = document.getElementById('form_main');

    // --- Variable to store the current invoice data ---
    let invoiceData = {};

    /**
     * Populates the invoice preview with data.
     * @param {object} data The data from the form.
     */
    function populateInvoice(data) {
        const date_parts = data.date.split('-');
        document.getElementById('date_output').textContent = `${date_parts[2]}/${date_parts[1]}/${date_parts[0]}`;

        const mainval = parseFloat(data.gstinput);
        const without_gst = parseFloat((mainval / 1.05).toFixed(2));
        const gst = parseFloat(((mainval - without_gst) / 2).toFixed(2));
        const full_value = (without_gst + 2 * gst).toFixed(2);
        const rounded_value = (mainval - full_value).toFixed(2);
        
        document.getElementById('tgst').textContent = (2 * gst).toFixed(2);
        document.querySelectorAll('.basic_value').forEach(e => e.textContent = without_gst.toFixed(2));
        document.querySelectorAll(".gst").forEach(element => element.textContent = gst.toFixed(2));
        document.getElementById('main_with_gst_value').textContent = mainval.toFixed(2);
        document.getElementById('rounded').textContent = rounded_value;
        
        document.getElementById('car_details').innerText = data.car_details.toUpperCase();
        document.getElementById("other_output").innerText = data.other_details.toUpperCase();
        document.getElementById('color').textContent = `${data.color.toUpperCase()} COLOUR`;
        document.getElementById('ch_output').textContent = data.chassis.toUpperCase();
        document.getElementById('quantity_output').textContent = `${data.quantity} NOS`;
        document.getElementById('biller_name').textContent = data.biller_name.toUpperCase();
        document.getElementById('city_output').textContent = `${data.city.toUpperCase()}, ${data.ps.toUpperCase()}, ${data.po.toUpperCase()}`;
        document.getElementById('dist_output').textContent = `${data.dist.toUpperCase()}, WEST BENGAL`;
        document.getElementById('pincode_output').textContent = data.pincode;
        document.getElementById('invoice_bill').textContent = data.invoice;
        document.getElementById('gstname').textContent = data.gst_name.toUpperCase();
        document.getElementById('aadhar_output').textContent = data.biller_aadhar;
        document.getElementById('number_output').textContent = data.biller_number;

        document.getElementById('amount_word').textContent = `${ConvertNumberToWords(mainval).toUpperCase()} ONLY.`;
        
        const basicwordEl = document.getElementById('basicword');
        let beforePoint = Math.floor(without_gst);
        let afterPoint = Math.round((without_gst - beforePoint) * 100);
        const a = ConvertNumberToWords(beforePoint);
        const b = ConvertNumberToWords(afterPoint);
        basicwordEl.textContent = `${a.toUpperCase()} AND ${b.toUpperCase()} PAISA ONLY`;
    }

    // --- Event listener for the main submit button ---
    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();

        invoiceData = {
            date: document.getElementById('date_input').value,
            invoice: document.getElementById('invoice').value,
            gstinput: document.getElementById('gstinput').value,
            biller_name: document.getElementById('biller_name_input').value,
            biller_number: document.getElementById('biller_number_input').value,
            biller_aadhar: document.getElementById('biller_aadhar_input').value,
            gst_name: document.getElementById('gst_name_input').value,
            city: document.getElementById('city').value,
            ps: document.getElementById('P.S').value,
            po: document.getElementById('P.O').value,
            dist: document.getElementById('dist').value,
            pincode: document.getElementById('pincode').value,
            car_details: document.getElementById('car_details_input').value,
            other_details: document.getElementById('car_details_input2').value,
            quantity: document.getElementById('quantity_input').value,
            color: document.getElementById('color_input').value,
            chassis: document.getElementById('ch_input').value,
        };

        populateInvoice(invoiceData);

        form_main.classList.remove("hidden");
        form_container.classList.add("hidden");
        editBtnContainer.classList.remove('hidden');
    });

    // --- Event listener for the Print Button ---
    printBtn.addEventListener('click', function () {
        if (!invoiceData.invoice) {
            alert("Please generate an invoice first.");
            return;
        }
        printInvoice(invoiceData.invoice);
        
        fetch(scriptURL, {
            method: 'POST',
            body: new FormData(form)
        })
        .then(response => {
            console.log("Form submitted successfully");
            alert("Bill details are successfully sent to server....");
        })
        .catch(error => {
            console.error('Error!', error.message);
        });
    });

    // --- Event listener for the Edit Button ---
    editBtn.addEventListener('click', function() {
        form_main.classList.add('hidden');
        editBtnContainer.classList.add('hidden');
        form_container.classList.remove('hidden');

        document.getElementById('date_input').value = invoiceData.date;
        document.getElementById('invoice').value = invoiceData.invoice;
        document.getElementById('gstinput').value = invoiceData.gstinput;
        document.getElementById('biller_name_input').value = invoiceData.biller_name;
        document.getElementById('biller_number_input').value = invoiceData.biller_number;
        document.getElementById('biller_aadhar_input').value = invoiceData.biller_aadhar;
        document.getElementById('gst_name_input').value = invoiceData.gst_name;
        document.getElementById('city').value = invoiceData.city;
        document.getElementById('P.S').value = invoiceData.ps;
        document.getElementById('P.O').value = invoiceData.po;
        document.getElementById('dist').value = invoiceData.dist;
        document.getElementById('pincode').value = invoiceData.pincode;
        document.getElementById('car_details_input').value = invoiceData.car_details;
        document.getElementById('car_details_input2').value = invoiceData.other_details;
        document.getElementById('quantity_input').value = invoiceData.quantity;
        document.getElementById('color_input').value = invoiceData.color;
        document.getElementById('ch_input').value = invoiceData.chassis;
    });

    // --- Event listener for the Test Data Button ---
    testDataBtn.addEventListener('click', () => {
        document.getElementById('date_input').value = '2025-08-15';
        document.getElementById('invoice').value = '252601';
        document.getElementById('gstinput').value = '165500';
        document.getElementById('biller_name_input').value = 'Surojit Das';
        document.getElementById('biller_number_input').value = '9876512345';
        document.getElementById('biller_aadhar_input').value = '123456789012';
        document.getElementById('gst_name_input').value = '';
        document.getElementById('city').value = 'Kakdwip';
        document.getElementById('P.S').value = 'Kakdwip';
        document.getElementById('P.O').value = 'Kakdwip';
        document.getElementById('dist').value = 'South 24 Parganas';
        document.getElementById('pincode').value = '743347';
        document.getElementById('car_details_input').value = 'MAXIMA E-RICKSHAW';
        document.getElementById('car_details_input2').value = `Exide 130 Amp Battery 13 Months
1. Motor No: MTR-12345
2. Controller No: CTL-67890
3. Chassis No is also mentioned below
4. 4-Seater with roof
Axiom 18amp Charger
Warranty: 1 Year on Motor`;
        document.getElementById('quantity_input').value = '1';
        document.getElementById('color_input').value = 'Blue';
        document.getElementById('ch_input').value = 'AB12CD34EF56GH78';
    });
});
