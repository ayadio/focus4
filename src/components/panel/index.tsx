import i18next from "i18next";
import {snakeCase, uniqueId} from "lodash";
import * as React from "react";
import {themr} from "react-css-themr";

import {ProgressBar} from "react-toolbox/lib/progress_bar";
import ButtonHelp from "../button-help";
import {PanelButtons, PanelButtonsProps} from "./buttons";
export {PanelButtons};

import * as styles from "../__style__/panel.css";

export type PanelStyle = Partial<typeof styles>;

/** Props du panel. */
export interface PanelProps extends PanelButtonsProps {
    /** Nom du bloc pour le bouton d'aide. Par défaut : premier mot du titre. */
    blockName?: string;
    /** Boutons à afficher dans le Panel. Par défaut : les boutons de formulaire (edit / save / cancel). */
    Buttons?: React.ComponentClass<PanelButtonsProps> | React.SFC<PanelButtonsProps>;
    /** Position des boutons. Par défaut : "top". */
    buttonsPosition?: "both" | "bottom" | "top" | "none";
    /** Masque le panel dans le ScrollspyContainer. */
    hideOnScrollspy?: boolean;
    /** Masque la progress bar lors du chargement/sauvegarde. */
    hideProgressBar?: boolean;
    /** Etat de chargement. */
    loading?: boolean;
    /** Affiche le bouton d'aide. */
    showHelp?: boolean;
    /** CSS. */
    theme?: PanelStyle;
    /** Titre du panel. */
    title?: string;
}

/** Construit un Panel avec un titre et des actions. */
export class Panel extends React.Component<PanelProps, void> {

    spyId = uniqueId("panel-");

    render() {
        const {blockName, Buttons = PanelButtons, buttonsPosition = "top", children, i18nPrefix, loading, saving, title, showHelp, editing, toggleEdit, save, hideOnScrollspy, hideProgressBar, theme} = this.props;

        const buttons = (
            <div className={theme!.actions!}>
                <Buttons editing={editing} i18nPrefix={i18nPrefix} save={save} saving={saving} toggleEdit={toggleEdit} />
            </div>
        );

        const areButtonsTop = ["top", "both"].find(i => i === buttonsPosition);
        const areButtonsDown = ["bottom", "both"].find(i => i === buttonsPosition);

        const spy = hideOnScrollspy ? {} : {"data-spy": this.spyId};

        return (
            <div className={`${theme!.panel!} ${loading || saving ? theme!.busy! : ""}`} {...spy}>
                {!hideProgressBar && (loading || saving) ? <ProgressBar mode="indeterminate" theme={{indeterminate: theme!.progress!}} /> : null}
                {title || areButtonsTop ?
                    <div className={`${theme!.title!} ${theme!.top!}`}>
                        {title ?
                            <h3>
                                <span data-spy-title>{i18next.t(title)}</span>
                                {showHelp ?
                                    <ButtonHelp blockName={blockName || snakeCase(i18next.t(title)).split("_")[0]} i18nPrefix={i18nPrefix} />
                                : null}
                            </h3>
                        : null}
                        {areButtonsTop ? buttons : null}
                    </div>
                : null}
                <div className={theme!.content!}>
                    {children}
                </div>
                {areButtonsDown ?
                    <div className={`${theme!.title!} ${theme!.bottom!}`}>
                        {buttons}
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("panel", styles)(Panel);
