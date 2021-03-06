import i18next from "i18next";
import * as React from "react";

import {themr} from "../theme";

import * as styles from "./__style__/select.css";
export type SelectStyle = Partial<typeof styles>;
const Theme = themr("select", styles);

/** Props du Select. */
export interface SelectProps {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nom du champ de libellé. */
    labelKey: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange?: (value: any) => void;
    /** CSS. */
    theme?: SelectStyle;
    /** Libellés des champs sans libellés. */
    unSelectedLabel?: string;
    /** Valeur. */
    value?: any;
    /** Nom du champ de valeur. */
    valueKey: string;
    /** Liste des valeurs. */
    values: {}[];
}

/** Surcouche de <select> pour s'interfacer avec un <Field>. */
export function Select({
    disabled,
    error,
    labelKey,
    name,
    onChange,
    theme: pTheme,
    value,
    valueKey,
    values,
    hasUndefined = true,
    i18nPrefix = "focus",
    unSelectedLabel = `${i18nPrefix}.select.unselected`
}: SelectProps) {
    // On ajoute l'élément vide si nécessaire.
    let finalValues = values;
    if (hasUndefined) {
        finalValues = [{[valueKey]: "", [labelKey]: i18next.t(unSelectedLabel)}, ...finalValues];
    }

    return (
        <Theme theme={pTheme}>
            {theme => (
                <div data-focus="select" className={`${theme.select} ${error ? theme.error : ""}`}>
                    <select
                        disabled={disabled}
                        id={name}
                        name={name}
                        onChange={({currentTarget: {value: v}}) => onChange && onChange(v || undefined)}
                        value={value === undefined ? "" : value}
                    >
                        {finalValues.map((val, idx) => {
                            const optVal = `${(val as any)[valueKey]}`;
                            const elementValue = (val as any)[labelKey];
                            const optLabel =
                                elementValue === undefined ? i18next.t(`${i18nPrefix}.select.noLabel`) : elementValue;
                            return (
                                <option key={idx} value={optVal}>
                                    {i18next.t(optLabel)}
                                </option>
                            );
                        })}
                    </select>
                    {error ? <div className={theme.errorLabel}>{error}</div> : null}
                </div>
            )}
        </Theme>
    );
}
