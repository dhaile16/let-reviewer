const batchData = {
    "Number Sense": [
        // BATCH 1
        questions.slice(0, 5),

        // BATCH 2
        [
            {
                question: "What is the place value of 7 in 4,782?",
                choices: ["7", "70", "700", "7,000"],
                answer: 2,
                explanation: "The digit 7 is in the hundreds place, so its place value is 700."
            },
            {
                question: "Which fraction is equivalent to 3/4?",
                choices: ["2/3", "6/8", "4/6", "5/8"],
                answer: 1,
                explanation: "Multiplying both the numerator and denominator of 3/4 by 2 gives 6/8."
            },
            {
                question: "What is 0.25 expressed as a percentage?",
                choices: ["2.5%", "20%", "25%", "250%"],
                answer: 2,
                explanation: "To convert a decimal to a percentage, multiply by 100. Thus, 0.25 = 25%."
            },
            {
                question: "What is the least common multiple of 6 and 8?",
                choices: ["12", "18", "24", "48"],
                answer: 2,
                explanation: "The smallest number divisible by both 6 and 8 is 24."
            },
            {
                question: "What is 15% of 300?",
                choices: ["30", "35", "45", "60"],
                answer: 2,
                explanation: "Multiply 300 by 0.15 to get 45."
            }
        ]
    ]
};