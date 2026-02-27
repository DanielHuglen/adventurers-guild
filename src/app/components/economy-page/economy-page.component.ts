import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MetaService } from 'app/services/meta.service';
import { EconomyDebtEntry, EconomyEarningsEntry, EconomyStatistics } from 'app/shared/api-models';
import { Subscription, take } from 'rxjs';
import { TAX_FREE_THRESHOLD_GOLD, UPPER_TAX_THRESHOLD_GOLD } from 'utils/economy-statistics';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { CharacterService } from 'app/services/character.service';
import { Character } from 'app/shared/character-models';

@Component({
	selector: 'app-economy-page',
	imports: [CommonModule, CharacterCardComponent],
	templateUrl: './economy-page.component.html',
	styleUrl: './economy-page.component.scss',
})
export class EconomyPageComponent {
	metaService = inject(MetaService);
	characterService = inject(CharacterService);

	stats = signal<EconomyStatistics | null>(null);
	topEarnerCharacter = signal<Character | null>(null);
	bottomEarnerCharacter = signal<Character | null>(null);
	highestDebtorCharacter = signal<Character | null>(null);

	sub = new Subscription();

	constructor() {
		this.sub.add(
			this.metaService.getEconomyStatistics().subscribe((stats) => {
				this.stats.set(stats);

				if (stats.topEarner) {
					this.characterService
						.getMember(stats.topEarner.memberId)
						.pipe(take(1))
						.subscribe((character) => {
							this.topEarnerCharacter.set(character);
						});
				}
				if (stats.bottomEarner) {
					this.characterService
						.getMember(stats.bottomEarner.memberId)
						.pipe(take(1))
						.subscribe((character) => {
							this.bottomEarnerCharacter.set(character);
						});
				}
				if (stats.debt.topDebtors.length > 0) {
					const highestDebtorId = stats.debt.topDebtors[0].memberId;
					this.characterService
						.getMember(highestDebtorId)
						.pipe(take(1))
						.subscribe((character) => {
							this.highestDebtorCharacter.set(character);
						});
				}
			}),
		);
	}

	// Taxes
	get currentTaxFreeGoldPercentage(): number {
		const { netGold } = this.stats()?.completedEconomy || {};
		if (netGold === undefined) return 0;

		const filled = Math.min(Math.max(netGold, 0), TAX_FREE_THRESHOLD_GOLD);
		return (filled / TAX_FREE_THRESHOLD_GOLD) * 100;
	}
	get roundedCurrentTaxFreeGoldPercentage(): number {
		return Math.round(this.currentTaxFreeGoldPercentage);
	}
	get currentLowerTaxBracketPercentage(): number {
		const { netGold } = this.stats()?.completedEconomy || {};
		if (netGold === undefined) return 0;

		const lowerBracketSize = UPPER_TAX_THRESHOLD_GOLD - TAX_FREE_THRESHOLD_GOLD;
		const filled = Math.min(Math.max(netGold - TAX_FREE_THRESHOLD_GOLD, 0), lowerBracketSize);
		return (filled / lowerBracketSize) * 100;
	}
	get roundedCurrentLowerTaxBracketPercentage(): number {
		return Math.round(this.currentLowerTaxBracketPercentage);
	}
	get currentUpperTaxBracketGold(): number {
		const { netGold } = this.stats()?.completedEconomy || {};
		if (netGold === undefined) return 0;

		return Math.max(netGold - UPPER_TAX_THRESHOLD_GOLD, 0);
	}

	// Missions
	get totalMissionsCount(): number {
		return this.stats()?.missions.total ?? 0;
	}
	get completedMissionsCount(): number {
		return this.stats()?.missions.completed ?? 0;
	}
	get inFlightMissionsCount(): number {
		return this.stats()?.missions.inFlight ?? 0;
	}
	get backlogMissionsCount(): number {
		return this.stats()?.missions.backlog ?? 0;
	}
	get tierMissionDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byTier ?? {};
	}
	get locationMissionDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byLocation ?? {};
	}
	get levelMissionDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byLevel ?? {};
	}

	// Economy
	get netGold(): number {
		return this.stats()?.completedEconomy.netGold ?? 0;
	}
	get avgGold(): string {
		return this.stats()?.completedEconomy.avgGold.toFixed(2) ?? '0';
	}
	get medianGold(): number {
		return this.stats()?.completedEconomy.medianGold ?? 0;
	}
	get minGold(): number {
		return this.stats()?.completedEconomy.minGold ?? 0;
	}
	get maxGold(): number {
		return this.stats()?.completedEconomy.maxGold ?? 0;
	}

	// Distribution
	get tierGoldDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byTier ?? {};
	}
	get locationGoldDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byLocation ?? {};
	}
	get levelGoldDistribution(): Record<string, { missions: number; gold: number }> {
		return this.stats()?.completedDistribution.byLevel ?? {};
	}

	// Pipeline and backlog tables
	get pipeline(): EconomyStatistics['pipeline'] {
		return this.stats()?.pipeline ?? { count: 0, minGold: 0, maxGold: 0, expectedGold: 0, items: [] };
	}
	get backlog(): EconomyStatistics['backlogOpportunity'] {
		return this.stats()?.backlogOpportunity ?? { count: 0, minGold: 0, maxGold: 0, expectedGold: 0, items: [] };
	}

	// Earnings and debt
	get topEarner(): EconomyEarningsEntry | null {
		return this.stats()?.topEarner ?? null;
	}
	get bottomEarner(): EconomyEarningsEntry | null {
		return this.stats()?.bottomEarner ?? null;
	}
	get highestDebtor(): EconomyDebtEntry | undefined {
		return this.stats()?.debt.topDebtors.length ? this.stats()?.debt.topDebtors[0] : undefined;
	}
	get totalDebt(): number {
		return this.stats()?.debt.total ?? 0;
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
