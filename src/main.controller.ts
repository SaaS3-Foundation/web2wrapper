import {
  Controller,
  Response,
  Get,
  Query,
} from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { assert } from 'console';
import fetch from 'node-fetch';

const teams = [  ["Qatar", "Ecuador"],
["England", "IR Iran"],
["Senegal", "Netherlands"],
["USA", "Wales"],
["Argentina", "Saudi Arabia"],
["Denmark", "Tunisia"],
["Mexico", "Poland"],
["France", "Australia"],
["Morocco", "Croatia"],
["Germany", "Japan"],
["Spain", "Costa Rica"],
["Belgium", "Canada"],
["Switzerland", "Cameroon"],
["Uruguay", "Korea Republic"],
["Portugal", "Ghana"],
["Brazil", "Serbia"],
["Wales", "IR Iran"],
["Qatar", "Senegal"],
["Netherlands", "Ecuador"],
["England", "USA"],
["Tunisia", "Australia"],
["Poland", "Saudi Arabia"],
["France", "Denmark"],
["Argentina", "Mexico"],
["Japan", "Costa Rica"],
["Belgium", "Morocco"],
["Croatia", "Canada"],
["Spain", "Germany"],
["Cameroon", "Serbia"],
["Korea Republic", "Ghana"],
["Brazil", "Switzerland"],
["Portugal", "Uruguay"],
["Netherlands", "Qatar"],
["Ecuador", "Senegal"],
["IR Iran", "USA"],
["Wales", "England"],
["Australia", "Denmark"],
["Tunisia", "France"],
["Saudi Arabia", "Mexico"],
["Poland", "Argentina"],
["Croatia", "Belgium"],
["Canada", "Morocco"],
["Costa Rica", "Germany"],
["Japan", "Spain"],
["Ghana", "Uruguay"],
["Korea Republic", "Portugal"],
["Cameroon", "Brazil"],
["Serbia", "Switzerland"],
];
type Participant = {
  participantID: string,
  participantName: string,
  score: string,
  logo: string,
}

type MatchResult = {
  gmtUpdated: number,
  calendar: {
    seasonID: number,
    leagueID: string,
    seasonName: string,
    fullName: string,
    stages: boolean,
    matchdays: [
      {
        matchdayID: string,
        matchdayName: string,
        matchdayPlayoff: string,
        matchdayType: string,
        matchdayStart: any,
        matchdayEnd: any,
        matches: [
          {
            matchID: string,
            matchStatus: {
              statusID: string,
            },
            matchDate: string,
            matchTime: string
            matchVenue: {
              venueID: string,
            },
            homeParticipant: Participant,
            awayParticipant: Participant,
            group: {
              groupID: string,
              groupName: string,
            }
          },
        ]
      }
    ]
  }
};


@Controller('/saas3/web2/qatar2022')
export class MainController {
  public constructor(
    private readonly configService: ConfigService,
  ) { }

  async qatar2022(): Promise<any> {
    let apikey = this.configService.get('QATAR2022_API_KEY');
    let season_id = this.configService.get('SEASON_ID');
    let url = 'https://api.statorium.com/api/v1/matches/?season_id=' + season_id + '&apikey=' + apikey;
    console.log(url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (response.status !== 200) {
      return { ok: false, err: 'qatar2022 api error' };
    }
    const result = (await response.json()) as MatchResult;
    return { ok: true, data: result };
  }

  same(a: string, b: string) {
    let aa = a.toString().toLowerCase();
    let bb = b.toString().toLowerCase();
    return aa.includes(bb) || bb.includes(aa);
  }

  checkTeams(mr: MatchResult) {
    let ok = teams.every((team) => {
      let matday_len = mr.calendar.matchdays.length;
      let match_result = 3;
      for( let i = matday_len - 1; i >= 0;i--) {
        let matchday = mr.calendar.matchdays[i];
        if (matchday.matches === undefined) {
          continue;
        }
        let found = false;
        let matches_len = matchday.matches.length;
        for (let j = matches_len - 1; j >= 0;j--) {
          let match = matchday.matches[j];
          console.log(match);
          if (this.same(match.homeParticipant.participantName, team[0]) && this.same(match.awayParticipant.participantName, team[1])) {
            return true;
          }
        }
      }
      return false;
    });
    assert(ok === true);
  }

  @Get('/played')
  async played(@Query() q: any): Promise<number> {
    console.log(q.home, q.guest);
    let data = await this.qatar2022();
    if (data.ok === false) {
      return 3;
    }
    let mr = data.data as MatchResult;
    console.log(mr);
    // this.checkTeams(mr);
    let matday_len = mr.calendar.matchdays.length;
    let match_result = 3;
    for( let i = matday_len - 1; i >= 0;i--) {
      let matchday = mr.calendar.matchdays[i];
      if (matchday.matches === undefined) {
        continue;
      }
      let found = false;
      let matches_len = matchday.matches.length;
      for (let j = matches_len - 1; j >= 0;j--) {
        let match = matchday.matches[j];
        console.log(match);
        if (match.matchStatus.statusID !== '1') {
          continue;
        }
        if (this.same(match.homeParticipant.participantName, q.home) && this.same(match.awayParticipant.participantName, q.guest)) {
          found = true;
          console.log("found match");
          let homescore = parseInt(match.homeParticipant.score);
          let guestscore = parseInt(match.awayParticipant.score);
          if (homescore > guestscore) {
            match_result = 1;
          } else if (homescore < guestscore) {
            match_result = 0;
          } else {
            match_result = 2;
          }
          break;
        }
      }
      if (found) {
        break;
      }
    }
    return match_result;
  }
}
