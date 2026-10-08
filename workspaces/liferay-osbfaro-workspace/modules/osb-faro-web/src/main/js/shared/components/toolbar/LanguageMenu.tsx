import * as API from 'shared/api';
import ClayButton from '@clayui/button';
import ClayDropDown, {Align} from '@clayui/drop-down';
import ClayIcon from '@clayui/icon';
import React, {useRef, useState} from 'react';
import {getLanguageLabel} from 'shared/util/locale';
import {useCurrentUser} from 'shared/hooks/useCurrentUser';

const LanguageMenu: React.FC = () => {
	const {languageId} = useCurrentUser();

	const [active, setActive] = useState(false);

	const triggerElementRef = useRef(null);

	return (
		<>
			<ClayButton
				aria-expanded={active}
				aria-haspopup="true"
				borderless
				className="rounded-lg text-nowrap"
				data-tooltip-align="bottom"
				displayType="secondary"
				onClick={() => setActive(!active)}
				ref={triggerElementRef}
				size="sm"
				title={Liferay.Language.get('language')}
			>
				<ClayIcon
					className="inline-item mr-sm-1"
					symbol="automatic-translate"
				/>

				<span className="d-none d-sm-inline">
					{getLanguageLabel(languageId)}
				</span>

				<ClayIcon
					className="d-none d-sm-inline-flex inline-item inline-item-after"
					symbol="caret-bottom"
				/>
			</ClayButton>

			<ClayDropDown.Menu
				active={active}
				alignElementRef={triggerElementRef}
				alignmentPosition={Align.BottomRight}
				onActiveChange={setActive}
				triggerRef={triggerElementRef}
			>
				<ClayDropDown.ItemList>
					{Object.entries(Liferay.Language.available).map(
						([id, label]) => (
							<ClayDropDown.Item
								active={languageId === id}
								key={id}
								onClick={() => {
									setActive(false);

									if (languageId === id) {
										return;
									}

									API.user
										.updateLanguage({
											languageId: id,
										})
										.then(() =>
											window.location.reload()
										);
								}}
							>
								{label}
							</ClayDropDown.Item>
						)
					)}
				</ClayDropDown.ItemList>
			</ClayDropDown.Menu>
		</>
	);
};

export default LanguageMenu;
