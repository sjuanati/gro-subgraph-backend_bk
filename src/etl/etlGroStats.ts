import { Subgraph } from '../types';
import { groStatsParser } from '../parser/groStats';
import { groStatsError } from '../parser/groStatsError';
import { getGroStats } from '../handler/groStatsHandler';
import { IGroStats } from '../interfaces/groStats/IGroStats';
import { groStatsParserEthereum } from '../parser/groStatsEth';
import { groStatsParserAvalanche } from '../parser/groStatsAvax';
import {
    now,
    getUrl,
} from '../utils/utils';
import {
    showInfo,
    showError,
} from '../handler/logHandler';


// @dev: get strategy harvests from the last 15d
export const etlGroStats = async (
    subgraph: Subgraph,
    skip: number,
    result: any
): Promise<IGroStats> => {
    try {
        const tsNow = parseInt(now());
        const url = getUrl(subgraph);
        const [
            resultEth,
            resultAvax,
        ] = await Promise.all([
            getGroStats(
                url.ETH,
                skip,
                result,
                tsNow,
            ),
            getGroStats(
                url.AVAX,
                skip,
                result,
                tsNow,
            )
        ]);
        if (resultEth.errors) {
            return groStatsError(
                tsNow.toString(),
                resultEth.errors.map((item: any) => item)
            );
        } else if (resultAvax.errors) {
            return groStatsError(
                tsNow.toString(),
                resultAvax.errors.map((item: any) => item)
            );
        } else if (resultEth && resultAvax) {
            const resultEthParsed = groStatsParserEthereum(
                resultEth,
                tsNow,
            );
            const resultAvaxParsed = groStatsParserAvalanche(
                resultAvax
            );
            const resultTotals = groStatsParser(
                resultEthParsed,
                resultAvaxParsed
            );
            showInfo(`Gro stats requested`);
            // if (process.env.NODE_ENV === Env.DEV)
            //     console.dir(resultTotals, { depth: null });
            return resultTotals;
        } else {
            return groStatsError(
                now(),
                'Unknown error in /etl/etlGroStats.ts->etlGroStats()',
            );
        }
    } catch (err) {
        showError('etl/etlGroStats.ts->etlGroStats()', err);
        return groStatsError(
            now(),
            err as string,
        );
    }
}
