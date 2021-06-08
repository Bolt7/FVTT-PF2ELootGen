/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum TableType {
    Treasure = 'treasure',
    Permanent = 'permanent',
    Consumable = 'consumable',
}

import { MODULE_NAME, PF2E_LOOT_SHEET_NAME } from '../Constants';
import { consumableTables, permanentItemsTables, treasureTables } from './data/Tables';
export const extendLootSheet = () => {
    type ActorSheetConstructor = new (...args: any[]) => ActorSheet;
    const extendMe: ActorSheetConstructor = CONFIG.Actor.sheetClasses['loot'][`pf2e.${PF2E_LOOT_SHEET_NAME}`].cls;
    class LootApp extends extendMe {
        static get defaultOptions() {
            // @ts-ignore
            const options = super.defaultOptions;
            options.classes = options.classes ?? [];
            options.classes = [...options.classes, 'pf2e-lootgen', 'loot-app'];
            options.tabs = [
                ...options.tabs,
                {
                    navSelector: '.loot-app-nav',
                    contentSelector: '.loot-app-content',
                    initial: 'treasure',
                },
            ];
            return options;
        }

        get title(): string {
            return 'PF2E Loot Gen';
        }

        get template(): string {
            return `modules/${MODULE_NAME}/templates/loot-app/index.html`;
        }

        /**
         * Fetch and package data needed to render a table row in the sheet.
         * @param name Nam of the table to include.
         * @param id Id of the table to lookup in flags.
         * @private
         */
        private getTableRenderData(name: string, id: string) {
            const getParam = function (actor: Actor, key: string): any {
                return actor.getFlag(MODULE_NAME, `${id}.${key}`);
            };

            const enabled: boolean = getParam(this.actor, 'enabled') ?? false;
            const weight: number = getParam(this.actor, 'weight') ?? 1;

            return {
                id,
                name,
                enabled,
                weight,
            };
        }

        private static async rollTables(event: JQuery.ClickEvent, type: TableType) {
            console.warn(event);
            console.warn(type);
        }

        public getData(options?: Application.RenderOptions) {
            const data = super.getData(options);

            data['magicItemTables'] = permanentItemsTables.map((table) => this.getTableRenderData(table.name, table.id));
            data['consumablesTables'] = consumableTables.map((table) => this.getTableRenderData(table.name, table.id));
            data['treasureTables'] = treasureTables.map((table) => this.getTableRenderData(table.name, table.id));

            console.warn(data);
            console.warn(data['actor'].flags['pf2e-lootgen']);

            return data;
        }

        public activateListeners(html: JQuery) {
            super.activateListeners(html);

            $('#roll-treasure').on('click', (event) => LootApp.rollTables(event, TableType.Treasure));
            $('#roll-magic-items').on('click', (event) => LootApp.rollTables(event, TableType.Permanent));
        }
    }
    return LootApp;
};
