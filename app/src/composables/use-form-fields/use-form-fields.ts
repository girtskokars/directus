/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { computed, Ref } from '@vue/composition-api';
import { isEmpty } from '@/utils/is-empty';
import getDefaultInterfaceForType from '@/utils/get-default-interface-for-type';
import interfaces from '@/interfaces';
import { FormField } from '@/components/v-form/types';
import { Field } from '@/stores/fields/types';

export default function useFormFields(fields: Ref<Field[]>) {
	const formFields = computed(() => {
		let formFields = [...fields.value];

		// Sort the fields on the sort column value
		formFields = formFields.sort((a, b) => {
			const aSort = a.system?.sort || null;
			const bSort = b.system?.sort || null;

			if (aSort === bSort) return 0;
			if (aSort === null) return 1;
			if (bSort === null) return -1;
			return aSort < bSort ? -1 : 1;
		});

		formFields = formFields.map((field, index) => {
			if (!field.system) {
				field.system = {
					id: -1,
					collection: field.collection,
					field: field.field,
					group: null,
					hidden: false,
					locked: false,
					interface: null,
					options: null,
					display: null,
					display_options: null,
					readonly: false,
					required: false,
					sort: null,
					special: null,
					translation: null,
					width: 'full',
					note: null,
				};
			}

			if (!field.system.width) {
				field.system.width = 'full';
			}

			let interfaceUsed = interfaces.find((int) => int.id === field.system.interface);
			const interfaceExists = interfaceUsed !== undefined;

			if (interfaceExists === false) {
				field.system.interface = getDefaultInterfaceForType(field.type);
			}

			interfaceUsed = interfaces.find((int) => int.id === field.system.interface);

			if (interfaceUsed?.hideLabel === true) {
				(field as FormField).hideLabel = true;
			}

			if (interfaceUsed?.hideLoader === true) {
				(field as FormField).hideLoader = true;
			}

			if (index !== 0 && field.system!.width === 'half') {
				const prevField = formFields[index - 1];

				console.log(prevField);

				if (prevField.system.width === 'half') {
					field.system.width = 'half-right';
				}
			}

			return field;
		});

		// Filter out the fields that are marked hidden on detail
		formFields = formFields.filter((field) => {
			const hidden = field.system?.hidden;
			const systemFake = field.field.startsWith('$');
			return hidden === false && systemFake === false;
		});

		return formFields;
	});

	return { formFields };
}
