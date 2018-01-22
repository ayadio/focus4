import i18next from "i18next";
import {upperFirst} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {DisplayProps, InputProps, LabelProps, Select, SelectProps} from "../../components";
import {ReferenceList} from "../../reference";

import {Domain, EntityField} from "../types";
import Field, {FieldOptions} from "./field";

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<
    T,
    ICProps = InputProps,
    DCProps = DisplayProps,
    LCProps = LabelProps
>(
    field: EntityField<T, Domain<ICProps, DCProps, LCProps>>,
    options: Partial<FieldOptions<T, ICProps, DCProps, LCProps>> = {}
) {
    options.onChange = options.onChange || action(`on${upperFirst(field.$field.name)}Change`, ((value: T) => field.value = value));
    return <Field field={field} {...options} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<
    T,
    ICProps = Partial<SelectProps>,
    DCProps = DisplayProps,
    LCProps = LabelProps
>(
    field: EntityField<T, Domain<any, DCProps, LCProps>>,
    values: ReferenceList,
    options: Partial<FieldOptions<T, ICProps, DCProps, LCProps>> = {}
) {
    options.SelectComponent = options.SelectComponent as any || Select;
    options.values = values;
    return fieldFor(field, options);
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param values L'éventulle liste de référence associée.
 */
export function stringFor<T>(field: EntityField<T>, values: ReferenceList = [] as any) {
    const {value, $field: {domain: {displayFormatter = (t: string) => i18next.t(t)}}} = field;
    const {$valueKey = "code", $labelKey = "label"} = values;
    const found = values.find(val => (val as any)[$valueKey] === value);
    const processedValue = found && (found as any)[$labelKey] || value;
    return displayFormatter(processedValue);
}