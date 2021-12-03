// Eri muuttujat, joiden avulla muokataan html tiedostoa
var junaContainer = document.getElementById("junat");
var junaSisalto = document.getElementById("sisalto");
var junaLista = document.getElementById("junaLista");
var teksti = document.getElementById("myInput");
var btn = document.getElementById("btn");

// Muuttujat
var paate = "HEL";
var suunta = "";
var htmlString = "";
const junaArray = [];

// Lisää eventlistener tekstin syöttökenttään, kun tekstiä syöttää alkaa ohjelmakoodi rullaamaan
teksti.addEventListener("input", Xml);

// Lisää eventlistener tekstin syöttökenttään, kun painaa enter näppäintä alkaa ohjelmakoodi rullaamaan
teksti.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        Xml();
    }
});

function Xml(){
    // Yhdistää sovelluksen tietokantaan, joka sisältää tietoa aktiivisista junista
    var url = 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + paate;
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', url);
    ourRequest.onload = function(){
        var ourData = JSON.parse(ourRequest.responseText);
        generateHtml(ourData);
    };
    ourRequest.send();
}

function generateHtml(data){  
    // Tässä funktiossa luodaan html elementtejä tietokannasta saatujen tietojen perusteella

    // Käyttäjän syöttämä tekstin muoto muutetaan automaattisesti isolla kirjaimella alkavaksi
    // koska tietokannassa sisältämä tieto on siinä muodossa
    var userInput = document.getElementById('myInput').value;
    const upperCaseInput = userInput.charAt(0).toUpperCase() + userInput.slice(1);
    etsiPaate(upperCaseInput);
    if(upperCaseInput === ""){
        junaLista.innerHTML = "";
    }

    // Ohjelma käy läpi tietokantaa ja poimii sieltä oleellista tietoa käytettäväksi
    for(i = 0; i<data.length; i++){

        // Tallentaa junan tyypin muuttujaan ja käy tietokannasta läpi kaikki junat joiden tyyppi on "Commuter"
        var tyyppi = data[i].trainCategory;
        if(tyyppi === "Commuter"){

            // Ohjelma etsii oikean aseman annetun päätteen ja lähtöstatuksen perusteella
            for(j = 0; j < data[i].timeTableRows.length;j++){
            if(data[i].timeTableRows[j].stationShortCode === paate && data[i].timeTableRows[j].type === "DEPARTURE"){          
                var aika = formatDate(new Date (data[i].timeTableRows[j].scheduledTime));
                // var nykyHetki = formatDate(new Date());

                // // Ohjelma tarkastaa onko lähtöaika ennen kuluvaa kellonaikaa, jos ei ole niin ohjelma jatkaa toimintaa
                // if (nykyHetki < aika){
                    var pituus = data[i].timeTableRows.length - 1;
                    suunta = data[i].timeTableRows[pituus].stationShortCode;
                    etsiAsemanNimi(suunta);

                        // Jos junaArray sisältää tietoa, luodaan html koodi, joka sisältää junien tiedot htmlString muuttujaan
                        if (junaArray[i] !== undefined) {
                            junaLista.innerHTML = "";
                            htmlString += "<div class='sisalto'>" + "<p class='lista'>" + " Juna:  " + data[i].commuterLineID + 
                            " Suunta: "+ junaArray[i] + " Lähtöaika: " + aika + ".</p>" + "</div>";
                    }
                // }
            }
        }
    }
}
    // Nollaa junaArrayn
    junaArray.length = 0;

    // Luodaan html elementit htmlString muuttujan perusteella
    junaLista.insertAdjacentHTML('beforeend', htmlString);

    // Nollaa htmlString muuttujan
    htmlString = "";
}


function formatDate(d){
    // Karsii päivämäärästä turhat tiedot pois
    var hours = d.getHours();
    var minutes = d.getMinutes();
    if(minutes < 10){
        minutes = "0"+ minutes;
    }
    return hours + ':' + minutes
  }


function etsiPaate(input) {
    //Etsii oikean aseman lyhenteen käyttäjän antaman tekstin perusteella
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', 'https://rata.digitraffic.fi/api/v1/metadata/stations');
    ourRequest.onload = function(){
        var asemaData = JSON.parse(ourRequest.responseText);
        for (i = 0; i < asemaData.length; i++) {
            if(asemaData[i].stationName.includes(input)=== true){    
                paate = asemaData[i].stationShortCode;
                return paate 
            } 
        }
    };
    ourRequest.send();

}

function etsiAsemanNimi(input) {
    //Etsii oikean aseman nimen annetun suunnan perusteella
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', 'https://rata.digitraffic.fi/api/v1/metadata/stations');
    ourRequest.onload = function(){
        var asemaData = JSON.parse(ourRequest.responseText);
        for (i = 0; i < asemaData.length; i++) {
            if(input === asemaData[i].stationShortCode){    
                junaArray.push(asemaData[i].stationName);
            }
        }
    };
    ourRequest.send();

}

