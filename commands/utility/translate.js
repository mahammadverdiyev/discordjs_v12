const translate = require('@iamtraction/google-translate');

//https://www.npmjs.com/package/@iamtraction/google-translate#usage

// []translate <language> <content> 

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'translate',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    args: true,
    aliases: ['ts'],
    usage: "<language(or language code) that you want to translate to>",
    guildOnly: true,
    async execute(message, args, commandName) {
        let languageToTranslate = args.shift().toLowerCase().trim();

        const languageCode = Object.keys(languages).find(langCode => langCode === languageToTranslate);


        if (!languageCode) {
            let ratios = [];
            Object.keys(languages).forEach(langCode => {
                const language = languages[langCode];
                const ratio = similarityRatio(language, languageToTranslate);
                ratios.push({ ratio: ratio, language: language, langCode: langCode });
            });
            let maxRatioObject = { ratio: 0, language: undefined, langCode: undefined };
            ratios.forEach(ratioObject => {
                // console.log(`Ratio: ${ratioObject.ratio} Lan: ${ratioObject.language}`)
                if (ratioObject.ratio > maxRatioObject.ratio) {
                    maxRatioObject = ratioObject;
                }
            });
            languageToTranslate = maxRatioObject.langCode;
        }

        const text = args.join(' ');
        const translatedData = await translate(text, { to: languageToTranslate });
        message.channel.send(translatedData.text);
    }
}

function similarityRatio(validLanguage, invalidLanguage) {
    let validLang = validLanguage.toLowerCase();
    let invalidLang = invalidLanguage.toLowerCase();

    const baseLength = validLang.length;

    let similarityCounter = 0;
    let length = validLang.length > invalidLang.length ? invalidLang.length : validLang.length;

    for (let index = 0; index < length; index++) {
        if (validLang.charAt(index) === invalidLang.charAt(index)) {
            similarityCounter++;
        }
    }

    // const ratio = (similarityCounter / baseLength) * 100;
    return similarityCounter;
}

const languages = {
    "auto": "Automatic",
    "af": "Afrikaans",
    "sq": "Albanian",
    "am": "Amharic",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-cn": "Chinese Simplified",
    "zh-tw": "Chinese Traditional",
    "co": "Corsican",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "fy": "Frisian",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "haw": "Hawaiian",
    "iw": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jw": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "ko": "Korean",
    "ku": "Kurdish (Kurmanji)",
    "ky": "Kyrgyz",
    "lo": "Lao",
    "la": "Latin",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "lb": "Luxembourgish",
    "mk": "Macedonian",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mn": "Mongolian",
    "my": "Myanmar (Burmese)",
    "ne": "Nepali",
    "no": "Norwegian",
    "ps": "Pashto",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sm": "Samoan",
    "gd": "Scots Gaelic",
    "sr": "Serbian",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "xh": "Xhosa",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
};
