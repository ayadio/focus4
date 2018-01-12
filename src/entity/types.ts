import {InputProps} from "react-toolbox/lib/input";

import {DisplayProps} from "../components";
import {ReactComponent} from "../config";

import {Validator} from "./validation";

/** Props de base pour un composant d'affichage. */
export interface BaseDisplayProps {
    formatter?: (x: any) => string;
    keyResolver?: (x: any) => Promise<string>;
    labelKey?: string;
    name?: string;
    onChange?: Function;
    theme?: {};
    value?: any;
    valueKey?: string;
    values?: any[];
}

/** Props de base pour un composant d'input. */
export interface BaseInputProps {
    error?: React.ReactNode;
    labelKey?: string;
    name?: string;
    onChange?: Function;
    theme?: {};
    value?: any;
    valueKey?: string;
    values?: any[];
}

/** Props de base pour un composant de libellé. */
export interface BaseLabelProps {
    name?: string;
    text?: string;
}

/** Définition de base d'un domaine, sans valeurs par défaut (sinon ça pose problème avec les EntityField). */
export interface DomainNoDefault<ICProps = {}, DCProps = {}, LCProps = {}> {
    /** Classe CSS pour le champ. */
    className?: string;

    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;

    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;

    /** Liste des validateurs. */
    validator?: Validator[];

    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ReactComponent<DCProps>;
    /** Props pour le composant d'affichage */
    displayProps?: Partial<DCProps>;

    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ReactComponent<ICProps>;
    /** Props pour le composant d'entrée utilisateur. */
    inputProps?: Partial<ICProps>;

    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ReactComponent<LCProps>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<LCProps>;
}

/** Définition de base d'un domaine. */
export interface Domain<ICProps extends BaseInputProps = Partial<InputProps>, DCProps extends BaseDisplayProps = DisplayProps, LCProps extends BaseLabelProps = BaseLabelProps> extends DomainNoDefault<ICProps, DCProps, LCProps> {}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<ICProps = {}, DCProps = {}, LCProps = {}> {
    readonly type: "field";

    /** Domaine du champ. */
    readonly domain: Domain<ICProps, DCProps, LCProps>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Identifiant unique de l'entrée. */
    readonly translationKey: string;
}

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entityName: string;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entityName: string;
}

/** Définition d'une entité. */
export interface Entity {

    /** Liste des champs de l'entité. */
    readonly fields: {readonly [name: string]: FieldEntry | ObjectEntry | ListEntry};

    /** Nom de l'entité. */
    readonly name: string;
}

/** Entrée de type "field" pour une entité. */
export interface EntityField<T, D extends DomainNoDefault = {}> {

    /** Métadonnées. */
    readonly $field: FieldEntry<D["inputProps"], D["displayProps"], D["labelProps"]>;

    /** Valeur. */
    value: T | undefined;
}
