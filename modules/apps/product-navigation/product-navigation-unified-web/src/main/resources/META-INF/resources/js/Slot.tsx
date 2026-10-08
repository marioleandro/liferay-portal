/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useEffect, useRef} from 'react';

/**
 * React hosts pass a node. Fragment hosts can't create React nodes, so they
 * pass the server-rendered element itself and the slot moves it in place.
 */
export type SlotContent = React.ReactNode | Element;

interface Props {
	className?: string;
	content: SlotContent;
}

export default function Slot({className, content}: Props) {
	const ref = useRef<HTMLDivElement>(null);

	const element = content instanceof Element ? content : null;

	useEffect(() => {
		if (element && ref.current && element.parentElement !== ref.current) {
			ref.current.appendChild(element);
		}
	}, [element]);

	if (element) {
		return <div className={className} ref={ref} />;
	}

	return <>{content as React.ReactNode}</>;
}
