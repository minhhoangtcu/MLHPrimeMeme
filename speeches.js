const allCongrats = {
	noVar: [
		"You did well today!",
		"I saw what you did today. Congratulation!",
	],
	oneVar: [
		"Congratulate on your ${0} today!",
	],
};

const allCheers = {
	noVar: [
		"I see that you are not doing so well today.",
		"Are you feeling well? Is there anything I could do to cheer you up?"
	],
	oneVar: [
		"What happened with the ${0} today?"
	],
}

function getRandomCheer(numOfVar) {

	let random = 0;

	switch(numOfVar) {
		case 0:
			random = Math.floor(Math.random() * allCheers.noVar.length);
			return allCheers.noVar[random];
		case 1:
			random = Math.floor(Math.random() * allCheers.oneVar.length);
			return allCheers.oneVar[random];
	}
	
}

function getRandomCelebration(numOfVar) {

	let random = 0;

	switch(numOfVar) {
		case 0:
			random = Math.floor(Math.random() * allCongrats.noVar.length);
			return allCongrats.noVar[random];
		case 1:
			random = Math.floor(Math.random() * allCongrats.oneVar.length);
			return allCongrats.oneVar[random];
	}

}

exports.getRandomCheer = getRandomCheer;