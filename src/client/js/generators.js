angular.module('generators', ['registries'])
.factory('generators.Generator', [ '$http', 'registries.safeUrlEncoder','schema-utils.SchemaUtilFactory','$q', function($http, urlEncoder,schemaUtilFactory,$q) {
	var service = {};

/** Counts porter(-berger) table
 * @teams - array of objects that will be used to define match
 * @terms - array of object that will be used to define round, its size limits result
 * @returns - object in form
		[{ round:<index>,term:<round_term>,,matches:[{home:teams[x1],visitors:teams[y1],board:<board_index>},...] },...]
 */
function bergerTable (teams,terms) {
	var floatTable = [];
	var n, i, increment=1, atype=1, minmove=0, flipcolors=0;


	if (teams.length%2===1){
		teams.push({complement:true});
	}

	n = teams.length;


	var nr = n-1; // Number of rounds

	var n2 = n / 2;
	var x, j, temp, colorFlag, incr;

	var max_round = terms.length ;

	var test_r = 0;
	var outRounds=[];

	for (var r=1; r<= max_round; r++) {	// r is the round number.
				var outRound={round:r,term:terms[r-1],matches:[]};
				outRounds.push(outRound);

		if (r == 1) {		 // Round 1 initially seat the players

			incr=n-3; j = 0;

			for (i = 1; i < n; i++) {
				floatTable[j]=i;
				j += incr;
				j = j % (n-1);
			}
			floatTable[nr]=n;	// Identifies the "ghost" player, will not move
		}
		else {			 // Other rounds, rotate the players "clockwise"
			temp = floatTable[n-2];
			for (i=n-2;	i > 0 ; i--) {
				floatTable[i] = floatTable[i-1];
			}
			floatTable[0] = temp;
		}
		if (r == n) {
			 flipcolors ^= 1; // Swap colors for 2nd half
			 test_r = 1; }

		i=0; // i is the board number about to be displayed, changed at bottom of loop
		if (atype == '1')
			increment=2;

		while (1) {	 //Must get out of this loop with break
			if (i === 0)	 //At ghost board, color determined by round number
				colorFlag = ((r-test_r)%2) ? 1 : 0;
			else			//On other boards, board number determines it
				colorFlag = (i % 2) ? 0 : 1;

			colorFlag ^= flipcolors; //Will reverse color assignment if checked

			var match={home: teams[floatTable[colorFlag?nr-i:i]-1] ,visitors:teams[floatTable[colorFlag?i:nr-i]-1] ,boar:i};

			if (i===0){
					match={home:match.visitors,visitors:match.home,board:i};
			}

			if (match.home.complement){
				outRound.notPlaying=match.visitors;
			} else if (match.visitors.complement){
				outRound.notPlaying=match.home;
			} else {
				outRound.matches.push(match);
			}

				if (minmove && (i===0) && (r % 2)===0)
							 i = 1;
				else
					i+= increment;
				if (i >= n2)
					if (increment == 1)	//Board number option
						break;
					else	{	//Come back to display the boards we missed
						increment = -2;
						i = ((i > n2) ? i - 3 : --i) ;
					}
				if ((i < 1) && (increment == -2)) //Finished with NOT board number option, exit loop
					break;
		}
	}

	// console.log(outRounds);
	// console.log(JSON.stringify(outRounds));
	return outRounds;
}
	function saveBerger(entity,callback){

		var saveSchema= schemaUtilFactory.encodeUri("uri://registries/refereeReport#new");
		var saved=0;
		var all=[];


		entity.saving=true;

		entity.generated.map(function(round){
			round.matches.map(function(match){
				var toSave={};
				toSave.baseData={};
				toSave.baseData.homeClub=match.home;
				toSave.baseData.awayClub=match.visitors;
				toSave.baseData.matchRound={registry:"schedules",oid:round.term.id};
				toSave.baseData.competition=entity.baseData.competition;
				toSave.baseData.competitionPart={registry:"competitionParts",oid:entity.id};
				toSave.baseData.matchDate=round.term.baseData.date;
				toSave.baseData.state='Otvorený';
				all.push( $http({url: '/udao/saveBySchema/'+saveSchema, method: 'PUT',data: toSave}));
			});
		});
		$q.all(all).then(function(){
		 		callback(null);
		});

	}

	function generateBerger(entity,callback){
		var searchSchema="uri://registries/schedule#search";
		$http({
			method : 'POST',
			url : '/search/' + schemaUtilFactory.encodeUri(searchSchema),
			data : {
				criteria :[{
					f : "baseData.competitionPart.oid",
					v : entity.id,
					op : "eq"
				}],
				sortBy: [ { f:"baseData.date", o: "asc"}]
			}
		}).success(function(terms){
			var teams=entity.listOfTeam.team;

			entity.generated=bergerTable(teams,terms);
			callback();
		}).error(function(err){
			callback(err);
		});
	}

	service.generate=function(entity,type,callback){
		switch (type){
			case "BERGER":
				generateBerger(entity,callback);
				break;
		}
	};
	service.save=function(entity,type,callback){
		switch (type){
			case "BERGER":
				saveBerger(entity,callback);
				break;
		}
	};
	return service;
} ]);
