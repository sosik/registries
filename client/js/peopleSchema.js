angular.module('registy_schema', [])
.constant('schema', {
    properties : {
        oid : {
            title: 'Identifikátor',
            type:'string',
            required: true,
            section: 'Základné údaje'
        },
        name : {
            title: 'Meno',
            type:'string',
            required: true
        },
        surName : {
            title: 'Priezvisko',
            type:'string',
            required: true
        },
        bornName : {
            title: 'Rodné priezvisko',
            type:'string',
            required: false
        },
        title : {
            title: 'Titul',
            type:'string',
            required: false
        },
        bithDate : {
            title: 'Dátum narodenia',
            type:'date',
            required: true
        },
        gender : {
            title: 'Pohlavie',
            type:' string',
            "enum" : ['Muž', 'Žena'],
            required: true
        },
        nationality : {
            title: 'Štatna prislusnosť',
            type: 'string',
            required: true
        },
        street : {
            title: 'Ulica',
            type: 'string',
            required: true,
            section: 'Kontaktné údaje'
        },
        houseNumber : {
            title: 'Číslo domu',
            type: 'string',
            required: true,
        },
        city : {
            title: 'Obec',
            type: 'string',
            required: true,
        },
        zipCode : {
            title: 'PSČ',
            type: 'string',
            required: true,
        },
        country : {
            title: 'Štát',
            type: 'string',
            required: true,
        },
        phoneNumber : {
            title: 'Telefón',
            type: 'string',
            required: false,
        },
        mobileNumber : {
            title: 'Mobil',
            type: 'string',
            required: false,
        },
        email : {
            title: 'E-mail',
            type: 'string',
            required: false,
        },
        bankAccount : {
            title: 'Číslo účtu',
            type: 'string',
            required: false,
            section: 'Bankové spojenie'
        },
        bankCode : {
            title: 'Kód banky',
            type: 'string',
            required: false,
        },
        iban : {
            title: 'IBAN',
            type: 'string',
            required: false,
        },
        swift : {
            title: 'SWIFT',
            type: 'string',
            required: false,
        },
        isPhotoPublic : {
            title: 'Je fotka verejná',
            type: 'boolean',
            required: false,
            section: 'Ostatné údaje'
        },
        idCardNumber : {
            title: 'Číslo OP',
            type: 'string',
            required: false,
        },
        note : {
            title: 'Poznámka',
            type: 'string',
            required: false,
            large: true
        },
    }
})