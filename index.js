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

    let integerPart = Math.floor(num); // Integer part
    let decimalPart = num % 1; // Decimal part
    let word = "";
    let i = 0;

    // Handle integer part
    while (integerPart > 0) {
        let chunk = integerPart % (i === 0 ? 1000 : 100);
        if (chunk !== 0) {
            word = helper(chunk) + places[i] + " " + word;
        }
        integerPart = Math.floor(integerPart / (i === 0 ? 1000 : 100));
        i++;
    }

    word = word.trim();

    // Handle decimal part
    if (decimalPart > 0) {
        let decimalWords = "point ";
        const decimals = decimalPart.toString().split(".")[1]; // Get digits after the decimal point
        for (let digit of decimals) {
            decimalWords += belowTwenty[parseInt(digit) - 1] + " "; // Convert digits to words
        }
        word += " " + decimalWords.trim();
    }

    return word.trim();
}

function printInvoice(e) {
    // Note: The printInvoice function no longer needs to hide the form,
    // as the submit handler already does that.
    document.body.classList.add("print");
    let el = document.getElementById("main_formm");
    el.classList.remove("hidden");
    html2pdf(el, {
        filename: 'MS#' + e + '.pdf',
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        html2canvas: { scale: 2 } // Higher scale for better resolution
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxAd4ZF3BfZcRomueGzf7QciFu2B6QKi_Rsn8Dld0zdLG7gOb4-vsAxLRzGFg1BuU-FcA/exec';
    const form = document.forms['google-sheet'];
    const submit = document.getElementById('but');

    // Get references to all elements we will manipulate
    const form_main = document.getElementById('form_main');
    const sample_form = document.getElementById('sample_form');
    const editBtn = document.getElementById('editBtn');
    const editBtnContainer = document.getElementById('editBtnContainer');

    submit.addEventListener('click', function (e) {
        e.preventDefault();

        // Hide the form and show the invoice preview
        form_main.classList.remove("hidden");
        sample_form.classList.add("hidden");

        var x = document.getElementById('date_input').value.split('-');
        const date_output = document.getElementById('date_output');
        date_output.textContent = x[2] + '/' + x[1] + '/' + x[0];

        const val = document.getElementById('gstinput');
        const half_gst = document.querySelectorAll(".gst");
        const mainval = parseFloat(val.value);
        const without_gst = (parseFloat((mainval / 1.05).toFixed(2)));
        const gst = parseFloat((mainval - without_gst).toFixed(2)) / 2;
        const full_value = parseFloat(2 * gst + without_gst).toFixed(2);
        const tgst = document.getElementById('tgst');
        tgst.textContent = `${2 * gst}`;
        const basic_value = document.querySelectorAll('.basic_value');
        basic_value.forEach(function (e) {
            e.textContent = `${without_gst}`;
        });
        half_gst.forEach(function (element) {
            element.textContent = `${gst}`;
        });

        const main_with_gst_value = document.getElementById('main_with_gst_value');
        main_with_gst_value.textContent = `${full_value}`;

        const rounded = document.getElementById('rounded');
        const rounded_value = (mainval - full_value).toFixed(2);
        rounded.textContent = `${rounded_value}`;

        const car_details_input = document.getElementById('car_details_input').value;
        const car_details = document.getElementById('car_details');
        car_details.innerText = car_details_input.toUpperCase();

        const otherDetails = document.getElementById("car_details_input2").value;
        document.getElementById("other_output").innerText = otherDetails.toUpperCase();

        const color_input = document.getElementById('color_input').value;
        const color = document.getElementById('color');
        color.textContent = `${color_input.toUpperCase()} COLOUR`;
        const ch_input = document.getElementById('ch_input').value;
        const ch_output = document.getElementById('ch_output');
        ch_output.textContent = `${ch_input.toUpperCase()}`;
        const quantity_input = document.getElementById('quantity_input').value;
        const quantity_output = document.getElementById('quantity_output')
        quantity_output.textContent = `${quantity_input} NOS`;

        const word = ConvertNumberToWords(mainval);
        const amount_word = document.getElementById('amount_word');
        amount_word.textContent = `${word.toUpperCase()} ONLY.`;

        const basicword = document.getElementById('basicword');
        let gh = without_gst;
        let beforePoint = Math.floor(gh);
        let afterPoint = Math.round((gh - beforePoint) * 100);
        const a = ConvertNumberToWords(beforePoint);
        const b = ConvertNumberToWords(afterPoint);
        const basword = `${a}` + ' AND ' + `${b}`;
        basicword.textContent = `${basword.toUpperCase()} PAISA ONLY`;

        const biller_name_input = document.getElementById('biller_name_input');
        const biller_name_value = biller_name_input.value;
        const spanBillerName = document.getElementById('biller_name');
        spanBillerName.textContent = `${biller_name_value.toUpperCase()}`;

        const city_name_input_val = document.getElementById('city').value;
        const PS_input_val = document.getElementById('P.S').value;
        const PO_input_val = document.getElementById('P.O').value;
        const dist_input_val = document.getElementById('dist').value;
        const pincode_input_val = document.getElementById('pincode').value;
        const invoice_input_val = document.getElementById('invoice').value;

        const city_output = document.getElementById('city_output');
        city_output.textContent = `${city_name_input_val.toUpperCase()} , ${PS_input_val.toUpperCase()} ,${PO_input_val.toUpperCase()}`;
        const dist_output = document.getElementById('dist_output');
        dist_output.textContent = `${dist_input_val.toUpperCase()} , WEST BENGAL`;
        const pincode_output = document.getElementById('pincode_output');
        pincode_output.textContent = `${pincode_input_val}`;
        const invoice_bill = document.getElementById('invoice_bill');
        invoice_bill.textContent = `${invoice_input_val}`;
        const gst_name_input = document.getElementById('gst_name_input').value;
        const gst_output = document.getElementById('gstname');
        gst_output.textContent = `${gst_name_input.toUpperCase()}`;

        const biller_number_input_val = document.getElementById('biller_number_input').value;
        const biller_aadhar_input_val = document.getElementById('biller_aadhar_input').value;

        const aadhar_output = document.getElementById('aadhar_output');
        aadhar_output.textContent = `${biller_aadhar_input_val}`;

        const number_output = document.getElementById('number_output');
        number_output.textContent = `${biller_number_input_val}`;
        document.getElementById('hidden_date').value = x[2] + '/' + x[1] + '/' + x[0];

        const print = document.getElementById('printBtn');
        print.addEventListener('click', function () {
            printInvoice(invoice_input_val);
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

            // START: New code to show the Edit button after a delay
            setTimeout(() => {
                editBtnContainer.style.display = 'inline-block'; // Or 'flex' if you prefer
            }, 7000); // 7000 milliseconds = 7 seconds
            // END: New code
        });
    });

    // START: New event listener for the Edit button
    editBtn.addEventListener('click', function() {
        // Hide the invoice preview
        form_main.classList.add('hidden');
        
        // Show the form again
        sample_form.classList.remove('hidden');

        // Hide the Edit button itself until the next print
        editBtnContainer.style.display = 'none';
    });
    // END: New event listener
});
