/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {clickAndExpectToBeVisible} from '../../utils/clickAndExpectToBeVisible';
import {PORTLET_URLS} from '../../utils/portletUrls';
import {waitForAlert} from '../../utils/waitForAlert';

const INSTANCE_SETTINGS_VALUE_INPUT_ID_PREFIX =
	'_com_liferay_configuration_admin_web_portlet_InstanceSettingsPortlet_value_';

export type TLanguageKey = {
	key: string;
	translations: {
		languageId: string;
		value: string;
	}[];
};

export type TLocalizationTab = 'Configuration' | 'Language Overrides';

export class LanguageOverridePage {
	readonly configurationTab: Locator;
	readonly filterButton: Locator;
	readonly languageOverridesTab: Locator;
	readonly newButton: Locator;
	readonly optionsButton: Locator;
	readonly page: Page;
	readonly saveButton: Locator;

	constructor(page: Page) {
		this.configurationTab = page.getByRole('link', {
			exact: true,
			name: 'Configuration',
		});
		this.filterButton = page.getByRole('button', {
			exact: true,
			name: 'Filter',
		});
		this.languageOverridesTab = page.getByRole('link', {
			exact: true,
			name: 'Language Overrides',
		});
		this.newButton = page.getByRole('link', {name: 'Add Language Key'});
		this.optionsButton = page.getByRole('button', {name: 'Options'});
		this.page = page;
		this.saveButton = page.getByRole('button', {name: 'Save'});
	}

	async addLanguageKey({key, translations}: TLanguageKey) {
		await this.newButton.click();

		await this.page.waitForLoadState();

		await this.page.getByLabel('key required').fill(key);

		for (const {languageId, value} of translations) {
			await this.updateTranslation(languageId, value);
		}

		await this.saveButton.click();

		await waitForAlert(this.page);
	}

	async addLanguageKeys(languageOverrides: TLanguageKey[]) {
		for (const languageOverride of languageOverrides) {
			await this.addLanguageKey(languageOverride);
		}
	}

	async assertLanguageKeyForSelectedLanguage(key: string) {
		await expect(this.page.getByRole('link', {name: key})).toBeAttached();
	}

	async assertLanguageKeyInListView({key, translations}: TLanguageKey) {
		if (translations.length) {
			const normalizedLanguageIds = translations.map(({languageId}) =>
				languageId.replace('-', '_')
			);

			await expect(
				this.page.locator(
					`a:has-text('${key}'):has-text("Languages With Override: ${normalizedLanguageIds.join(', ')}")`
				)
			).toBeVisible();
		}
		else {
			await this.assertLanguageKeyForSelectedLanguage(key);
		}
	}

	async assertLanguageKeyHasNoOverrideForLocale(
		key: string,
		languageId: string
	) {
		await expect(
			this.page.getByRole('link', {name: key})
		).not.toContainText(languageId.replace('-', '_'));
	}

	async assertLanguageKeyNotInListView(key: string) {
		await expect(this.page.getByRole('link', {name: key})).toBeHidden();
	}

	async assertLanguageKeyTranslationIsEmpty(languageId: string) {
		await expect(this.getTranslationInput(languageId)).toHaveValue('');
	}

	async assertLanguageKeyTranslationValue(languageId: string, value: string) {
		const translationInput = this.getTranslationInput(languageId);

		expect(await translationInput.inputValue()).toBe(value);
	}

	async assertLanguageKeyTranslations({key, translations}: TLanguageKey) {
		await this.page.getByRole('link', {name: key}).click();

		await this.page.waitForLoadState();

		for (const {languageId, value} of translations) {
			await expect(this.getTranslationInput(languageId)).toHaveValue(
				value
			);
		}
	}

	async assertNoLanguageEntriesWereFound() {
		await expect(
			this.page.getByText('No language entries were found.')
		).toBeVisible();
	}

	async assertTabIsActive(tab: TLocalizationTab) {
		await expect(this.getTab(tab)).toHaveClass(/active/);
	}

	async changeFilter(option: 'Any Language' | 'Selected Language') {
		await clickAndExpectToBeVisible({
			autoClick: true,
			target: this.page.getByRole('menuitem', {name: option}),
			trigger: this.filterButton,
		});

		await this.page
			.getByText('Search Results', {exact: true})
			.waitFor({state: 'visible'});
	}

	async changeLocale(currentLanguageId: string, languageId: string) {
		await clickAndExpectToBeVisible({
			autoClick: true,
			target: this.page.getByRole('menuitem', {name: languageId}),
			trigger: this.page.getByRole('button', {name: currentLanguageId}),
		});

		await this.page.waitForLoadState();

		await this.page.getByRole('button', {name: languageId}).waitFor();
	}

	async editLanguageKey(key: string) {
		await this.page.getByRole('link', {name: key}).click();
	}

	async exportOverridenTranslations() {
		await this.optionsButton.click();

		await this.page
			.getByRole('menuitem', {name: 'Export Overridden Translations'})
			.click();
	}

	async goto() {
		await this.page.goto(`/group/guest${PORTLET_URLS.languageOverride}`);
	}

	async goToTab(tab: TLocalizationTab) {
		await this.getTab(tab).click();

		await this.page.waitForLoadState();

		await this.assertTabIsActive(tab);
	}

	async importLanguageFile({
		expectedErrorMessage,
		filePath,
		languageId,
	}: {
		expectedErrorMessage?: string;
		filePath: string;
		languageId?: string;
	}) {
		if (await this.page.getByText('Import Translations').isHidden()) {
			await this.page
				.getByTestId('headerOptions')
				.getByLabel('Options')
				.click();

			await this.page
				.getByRole('menuitem', {name: 'Import Translations'})
				.click();
		}

		if (languageId) {
			await this.page.getByLabel('Language').selectOption(languageId);
		}

		await this.page.locator('input[type="file"]').setInputFiles(filePath);

		await this.saveButton.click();

		await this.page.waitForLoadState();

		if (expectedErrorMessage) {
			await expect(
				this.page.getByText(expectedErrorMessage)
			).toBeVisible();
		}
		else {
			await waitForAlert(this.page);
		}
	}

	async removeTranslationOverrideForCurrentLocale(key: string) {
		await this.clickRowActionAndAcceptDialog(
			key,
			'Remove translation override for'
		);
	}

	async removeAllTranslationOverrides(key: string) {
		await this.clickRowActionAndAcceptDialog(
			key,
			'Remove all translation overrides'
		);
	}

	async searchLanguageKey(key: string) {
		await this.page.getByRole('searchbox', {name: 'Search for:'}).click();
		await this.page.getByRole('searchbox', {name: 'Search for:'}).fill(key);

		await this.page
			.getByRole('button', {exact: true, name: 'Search for'})
			.click();

		await this.page.waitForLoadState();

		await this.page.getByText('Search Results').waitFor({state: 'visible'});
	}

	async updateTranslation(languageId: string, value: string) {
		const translationInput = this.getTranslationInput(languageId);

		await translationInput.click();
		await translationInput.fill(value);
	}

	private async clickRowActionAndAcceptDialog(
		languageKey: string,
		option: string
	) {
		const actionsButton = this.page
			.getByTestId('row')
			.filter({hasText: languageKey})
			.getByRole('button');

		this.page.once('dialog', (dialog) => {
			dialog.accept();
		});

		await clickAndExpectToBeVisible({
			autoClick: true,
			target: this.page.getByText(option),
			trigger: actionsButton,
		});

		await waitForAlert(this.page);
	}

	private getTab(tab: TLocalizationTab) {
		return tab === 'Configuration'
			? this.configurationTab
			: this.languageOverridesTab;
	}

	private getTranslationInput(languageId: string) {
		return this.page.locator(
			`[id="${INSTANCE_SETTINGS_VALUE_INPUT_ID_PREFIX}${languageId.replace('-', '_')}"]`
		);
	}
}
