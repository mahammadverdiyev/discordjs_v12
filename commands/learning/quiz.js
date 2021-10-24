const dquiz = require('discord-quiz');
const fetch = require('node-fetch');

let url = 'https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple';
const difficultyLevels = [
    'easy',
    'medium',
    'hard',
]
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'quiz',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Generates quiz about Computer Science according to difficulty level.(Easy as default.)',
    usage: '<difficulty level>',
    async execute(message, args, commandName) {
        let level = 'easy';
        if (args.length) {
            level = args.join(' ').trim();
            if (!difficultyLevels.includes(level)) {
                message.reply(`Please enter valid difficulty level.\nLevels: ${difficultyLevels.join(', ')}`);
                return;
            }
        }

        const getUrl = level => {
            return `https://opentdb.com/api.php?amount=10&category=18&difficulty=${level}&type=multiple`
        }


        const url = getUrl(level);
        const response = await fetch(url);
        const json = await response.json();

        const allQuiz = json.results;

        allQuiz.forEach(quiz => {
            const correctAnswer = quiz.correct_answer;
            const incorrectAnswers = quiz.incorrect_answers;
            const question = quiz.question;
            const category = quiz.category;
            const difficulty = quiz.difficulty;
            dquiz.add_question(question, correctAnswer, incorrectAnswers, category, difficulty);
        });

        dquiz.quiz(message, 10, 'RANDOM');
    }
}