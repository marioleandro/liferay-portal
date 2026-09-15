/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.language.override.web.internal.servlet;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * @author Mario Leandro
 */
public class PLOJSPIncluder {

	public static void include(
			ServletContext servletContext, String jspPath,
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		RequestDispatcher requestDispatcher =
			servletContext.getRequestDispatcher(jspPath);

		try {
			requestDispatcher.include(httpServletRequest, httpServletResponse);
		}
		catch (Exception exception) {
			throw new IOException(
				"Unable to include JSP " + jspPath, exception);
		}
	}

}