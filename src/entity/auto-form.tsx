import {autobind} from "core-decorators";
import {action, computed, Lambda, observable, ObservableMap, reaction, runInAction} from "mobx";
import * as PropTypes from "prop-types";
import * as React from "react";
import {v4} from "uuid";

import {PanelProps} from "../components";
import {messageStore} from "../message";
import {classAutorun} from "../util";

import {toFlatValues} from "./store";
import {FormNode, StoreNode} from "./types";

import {form} from "./__style__/auto-form.css";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions {

    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

    /** Par défaut: true */
    hasForm?: boolean;

    /** Préfixe i18n pour les messages du formulaire (par défaut: "focus") */
    i18nPrefix?: string;
}

/** Config de services à fournir à AutoForm. */
export interface ServiceConfig {

    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;

    /** Service de chargement. */
    load?: (...args: any[]) => Promise<{}>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: {}) => Promise<{}>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
@autobind
export abstract class AutoForm<P = {}> extends React.Component<P, void> {

    /** Map de tous les formulaires actuellement affichés avec leur état en édition */
    static readonly editingMap: ObservableMap<boolean> = observable.map<boolean>();

    /** Précise si au moins un formulaire de l'application est en édition. */
    @computed
    static get isOneEdit() {
        return AutoForm.editingMap.values()
            .some(x => x);
    }

    static childContextTypes = {theme: PropTypes.object, form: PropTypes.object};

    // On ne peut pas injecter le contexte dans le form (héritage...) donc on va le chercher directement pour le style CSS.
    static contextTypes = {theme: PropTypes.object};
    context: {theme: {[key: string]: {[key: string]: any}}};

    readonly formContext: {forceErrorDisplay: boolean} = observable({forceErrorDisplay: false});
    getChildContext() {
        return {theme: this.context.theme, form: this.formContext};
    }

    /** Identifiant unique du formulaire. */
    formId = v4();

    /** Etat courant du formulaire, à définir à partir de `makeFormNode`. Sera réinitialisé à chaque modification du `sourceNode`. */
    abstract entity: StoreNode & FormNode;

    /** Services. */
    services: ServiceConfig;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Classe CSS additionnelle (passée en options). */
    private className: string;

    /** Insère ou non un formulaire HTML. */
    private hasForm: boolean;

    /** Préfixe i18n pour les messages du formulaire */
    private i18nPrefix: string;

    /** Disposer de la réaction de chargement. */
    private loadDisposer?: Lambda;

    /**
     * A implémenter pour initialiser le formulaire. Il faut appeler `this.formInit` à l'intérieur.
     *
     * Sera appelé pendant `componentWillMount` avant le chargement.
     */
    abstract init(): void;

    /**
     * Initialise le formulaire.
     * @param storeData L'EntityStoreData de base du formulaire.
     * @param services La config de services pour le formulaire ({delete?, getLoadParams, load, save}).
     * @param options Options additionnelles.
     */
    formInit(services: ServiceConfig, {className, hasForm, i18nPrefix}: AutoFormOptions = {}) {
        this.services = services;
        this.hasForm = hasForm !== undefined ? hasForm : true;
        this.className = className || "";
        this.i18nPrefix = i18nPrefix || "focus";

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, this.load, {compareStructural: true});
        }
    }

    componentWillMount() {
        this.init();
        AutoForm.editingMap.set(this.formId, this.entity.form.isEdit);
        this.entity.subscribe();
        this.load();
    }

    componentWillUnmount() {
        AutoForm.editingMap.delete(this.formId);
        this.entity.unsubscribe();
        if (this.loadDisposer) {
            this.loadDisposer();
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit(isEdit: boolean) {
        this.entity.form.isEdit = isEdit;
        if (!isEdit) {
            this.entity.reset();
        }
    }

    @classAutorun protected updateApplicationStore() {
        AutoForm.editingMap.set(this.formId, this.entity.form.isEdit);
    }

    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    @action
    async load() {
        const {getLoadParams, load} = this.services;

        // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
        if (getLoadParams && load) {
            const params = getLoadParams();
            if (params) {
                this.isLoading = true;
                this.entity.sourceNode.clear();
                const data = await load(...params);
                runInAction("afterLoad", () => {
                    this.entity.sourceNode.set(data);
                    this.isLoading = false;
                });
                this.onFormLoaded();
            }
        }
    }

    /** Appelle le service de sauvegarde. */
    @action
    async save() {
        // On force l'affichage des erreurs.
        this.formContext.forceErrorDisplay =  true;

        // On ne sauvegarde que si la validation est en succès.
        if (!this.entity.form || this.entity.form.isValid) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                runInAction("afterSave", () => {
                    this.isLoading = false;
                    this.entity.form.isEdit = false;
                    this.entity.sourceNode.set(data); // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                });
                this.onFormSaved();
            } catch (e) {
                this.isLoading = false;
            }
        }
    }

    /** Est appelé après le chargement. */
    onFormLoaded() {
        // A éventuellement surcharger.
    }

    /** Est appelé après la sauvegarde. */
    onFormSaved() {
        messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.saved`);
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelProps(): PanelProps {
        return {
            editing: this.entity.form.isEdit,
            loading: this.isLoading,
            save: this.save,
            toggleEdit: this.toggleEdit,
        };
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        const contextClassName = this.context && this.context.theme && this.context.theme["form"] || "";
        if (this.hasForm) {
            return (
                <form
                    className={`${form} ${contextClassName} ${this.className}`}
                    noValidate={true}
                    onSubmit={e => { e.preventDefault(); this.save(); }}
                >
                    <fieldset>{this.renderContent()}</fieldset>
                </form>
            );
        } else {
            return this.renderContent();
        }
    }
}

export default AutoForm;
