/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.display.context;

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.settings.LocalizedValuesMap;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.language.override.model.PLOEntry;
import com.liferay.portal.language.override.provider.PLOOriginalTranslationProvider;
import com.liferay.portal.language.override.service.PLOEntryLocalService;

import jakarta.portlet.RenderRequest;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Drew Brokke
 */
@Component(service = EditDisplayContextFactory.class)
public class EditDisplayContextFactory {

	public EditDisplayContext create(RenderRequest renderRequest) {
		EditDisplayContext editDisplayContext = new EditDisplayContext();

		long companyId = _portal.getCompanyId(renderRequest);

		editDisplayContext.setAvailableLocales(
			LanguageUtil.getCompanyAvailableLocales(companyId));

		editDisplayContext.setBackURL(
			ParamUtil.getString(renderRequest, "backURL"));

		String key = ParamUtil.getString(renderRequest, "key");

		editDisplayContext.setKey(key);

		LocalizedValuesMap localizedValuesMap = new LocalizedValuesMap();
		LocalizedValuesMap originalValuesLocalizedValuesMap =
			new LocalizedValuesMap();

		_populateLocalizedValuesMap(
			companyId, key, localizedValuesMap,
			originalValuesLocalizedValuesMap);

		editDisplayContext.setOriginalValuesLocalizedValuesMap(
			originalValuesLocalizedValuesMap);

		if (Validator.isNotNull(key)) {
			editDisplayContext.setPageTitle(
				LanguageUtil.format(
					_portal.getLocale(renderRequest), "edit-language-key-x",
					key, false));
		}
		else {
			editDisplayContext.setPageTitle(
				LanguageUtil.get(
					_portal.getLocale(renderRequest), "add-language-key"));
		}

		editDisplayContext.setSelectedLanguageId(
			ParamUtil.getString(
				renderRequest, "selectedLanguageId",
				LocaleUtil.toLanguageId(_portal.getLocale(renderRequest))));

		if (MapUtil.isNotEmpty(originalValuesLocalizedValuesMap.getValues())) {
			editDisplayContext.setShowOriginalValues(true);
		}

		editDisplayContext.setValuesLocalizedValuesMap(localizedValuesMap);

		return editDisplayContext;
	}

	private void _populateLocalizedValuesMap(
		long companyId, String key, LocalizedValuesMap localizedValuesMap,
		LocalizedValuesMap originalValuesLocalizedValuesMap) {

		if ((key == null) || key.equals(StringPool.BLANK)) {
			return;
		}

		for (Locale locale :
				LanguageUtil.getCompanyAvailableLocales(companyId)) {

			String languageId = LocaleUtil.toLanguageId(locale);

			PLOEntry ploEntry = _ploEntryLocalService.fetchPLOEntry(
				companyId, key, languageId);

			if (ploEntry != null) {
				localizedValuesMap.put(locale, ploEntry.getValue());
			}

			String originalValue = _ploOriginalTranslationProvider.get(
				locale, key);

			if (Validator.isNotNull(originalValue)) {
				originalValuesLocalizedValuesMap.put(locale, originalValue);
			}
		}
	}

	@Reference
	private PLOEntryLocalService _ploEntryLocalService;

	@Reference
	private PLOOriginalTranslationProvider _ploOriginalTranslationProvider;

	@Reference
	private Portal _portal;

}