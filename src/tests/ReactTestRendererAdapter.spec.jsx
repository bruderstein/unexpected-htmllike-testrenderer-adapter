
import React from 'react';
import Unexpected from 'unexpected';
import Immutable from 'immutable';
import ReactTestRenderer from 'react-test-renderer';

import ReactTestRendererAdapter from '../';

const expect = Unexpected.clone();

const TestComponent = React.createClass({

    render() {
        return <span>test</span>;
    }
});


describe('ReactTestElementAdapter', () => {

    let adapter;

    beforeEach(() => {
        adapter = new ReactTestRendererAdapter();
    });

    describe('getName()', () => {

        it('gets the name of a native component', () => {

            const renderer = ReactTestRenderer.create(<span />);
            expect(adapter.getName(renderer.toJSON()), 'to equal', 'span');
        });

        it('gets the name of a createClass style custom component rendered component', () => {

            const renderer = ReactTestRenderer.create(<TestComponent />);
            expect(adapter.getName(renderer.toJSON()), 'to equal', 'span');
        });

    });

    describe('getAttributes()', () => {

        it('gets standard string attributes', () => {

            const component = ReactTestRenderer.create(<span test1="foo" test2="bar" />);
            expect(adapter.getAttributes(component.toJSON()), 'to equal', {
                test1: 'foo',
                test2: 'bar'
            });
        });

        it('gets numeric attributes', () => {

            const component = ReactTestRenderer.create(<span test1={42} test2={305.12} />);
            expect(adapter.getAttributes(component.toJSON()), 'to equal', {
                test1: 42,
                test2: 305.12
            });
        });

        it('gets object attributes', () => {

            const component = ReactTestRenderer.create(<span test1={ { test: 'foo', num: 42 } } />);
            expect(adapter.getAttributes(component.toJSON()), 'to equal', {
                test1: { test: 'foo', num: 42 }
            });
        });
    });

    describe('setOptions()', () => {

        it('sets an option', () => {

            adapter.setOptions({ someOption: true });
            expect(adapter.getOptions(), 'to satisfy', { someOption: true });
        });
    });

    describe('getChildren()', () => {

        it('gets an empty array when there are no children', () => {

            const component = ReactTestRenderer.create(<span />);
            expect(adapter.getChildren(component.toJSON()), 'to equal', []);
        });

        it('gets an array with one string child', () => {

            const component = ReactTestRenderer.create(<span>foo</span>);
            expect(adapter.getChildren(component.toJSON()), 'to equal', [ 'foo' ]);
        });

        it('gets an array with one numeric child', () => {

            const component = ReactTestRenderer.create(<span>{42}</span>);
            expect(adapter.getChildren(component.toJSON()), 'to equal', [ 42 ]);
        });

        it('gets an array with a component child', () => {

            const component = ReactTestRenderer.create(
                <span>
                    <div>some text</div>
                </span>
            );
            expect(adapter.getChildren(component.toJSON()), 'to equal', [ { type: 'div', props: {}, children: [ 'some text' ] } ]);
        });

        it('gets an array with several component children', () => {

            const component = ReactTestRenderer.create(
                <span>
                    <div>some text</div>
                    <div>foo</div>
                    <span attrib="hello world">cheese</span>
                </span>
            );
            
            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                { type: 'div', props: {}, children: ['some text'] },
                { type: 'div', props: {}, children: ['foo'] },
                { type: 'span', props: { attrib: 'hello world' }, children: [ 'cheese' ] }
            ]);
        });

        it('does not concat text children by default', () => {

            const component = ReactTestRenderer.create(<span>Hello {42} world</span>);

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                'Hello ', 42, ' world'
            ]);
        });

        it('does concat text children when concatTextContent is true', () => {

            const component = ReactTestRenderer.create(<span>Hello {42} world</span>);
            adapter.setOptions({ concatTextContent: true })

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                'Hello 42 world'
            ]);
        });

        it('converts content to strings when `convertToString` option is true', () => {

            const component = ReactTestRenderer.create(<span>Hello {42} world</span>);
            adapter.setOptions({ convertToString: true });

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                'Hello ', '42', ' world'
            ]);
        });

        it('converts content with null when `convertToString` option is true', () => {

            const component = ReactTestRenderer.create(<span>Hello {null} world</span>);
            adapter.setOptions({ convertToString: true });

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                'Hello ', ' world'
            ]);
        });

        it('converts only raw content to strings', () => {

            const component = ReactTestRenderer.create(
                <div>
                    <span>Hello world {21}</span>
                    <span>{42}</span>
                </div>
            );
            adapter.setOptions({ convertToString: true });

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                { type: 'span', props: {}, children: ['Hello world ', 21] },
                { type: 'span', props: {}, children: [ 42 ] }
            ]);
        });

        it('converts multiple raw content to strings using `convertMultipleRawToStrings:true`', () => {

                const component = ReactTestRenderer.create(<span>Hello world {21}</span>);
                adapter.setOptions({ convertMultipleRawToStrings: true });

                expect(adapter.getChildren(component.toJSON()), 'to equal', [
                    'Hello world ', '21'
                ]);
        });

        it('leaves single raw content alone with `convertMultipleRawToStrings:true`', () => {

            const component = ReactTestRenderer.create(<span>{21}</span>);
            adapter.setOptions({ convertMultipleRawToStrings: true });

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                21
            ]);
        });

        it('leaves content when there is only one item, after ignoring `null`s', () => {

            const component = ReactTestRenderer.create(<span>{null}{21}</span>);
            adapter.setOptions({ convertMultipleRawToStrings: true });

            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                21
            ]);
        });

        it('ignores the `key` attribute', () => {

            const component = ReactTestRenderer.create(<span key="abc" id="foo"></span>);

            expect(adapter.getAttributes(component.toJSON()), 'to equal', { id: 'foo' });
        });

        // This test fails, because refs aren't supported by the renderer
        it.skip('ignores the `ref` attribute', () => {

            const component = ReactTestRenderer.create(<span ref={() => {}} id="foo"></span>);

            expect(adapter.getAttributes(component.toJSON()), 'to equal', { id: 'foo' });
        });


        it('ignores boolean elements', () => {
            const component = ReactTestRenderer.create(<span>{true}</span>);
            expect(adapter.getChildren(component.toJSON()), 'to equal', []);
        });

        it('returns the children from an iterator', () => {

            // Use an immutable.js List as an iterator
            const list = Immutable.List([ <span key="1">one</span>, <span key="2">two</span>, <span key="3">three</span>]);

            const component = ReactTestRenderer.create(<span>{list}</span>);
            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                { type: 'span', props: {}, children: [ 'one' ] },
                { type: 'span', props: {}, children: [ 'two' ] },
                { type: 'span', props: {}, children: [ 'three' ] }
            ]);
        });

        it('flattens the children', () => {
            const list = [
                <span key="1">one</span>,
                <span key="2">two</span>,
                [
                    <span key="3">three</span>,
                    <span key="4">Four</span>,
                    <span key="5">Five</span>,
                    [
                        <span key="6">Six</span>,
                        <span key="7">Seven</span>
                    ],
                    <span key="8">Eight</span>
                ],
                <span key="9">Nine</span>,
                <span key="10">Ten</span>
            ];

            const component = ReactTestRenderer.create(<span>{list}</span>);
            expect(adapter.getChildren(component.toJSON()), 'to equal', [
                { type: 'span', props: {}, children: [ 'one' ] },
                { type: 'span', props: {}, children: [ 'two' ] },
                { type: 'span', props: {}, children: [ 'three' ] },
                { type: 'span', props: {}, children: [ 'Four' ] },
                { type: 'span', props: {}, children: [ 'Five' ] },
                { type: 'span', props: {}, children: [ 'Six' ] },
                { type: 'span', props: {}, children: [ 'Seven' ] },
                { type: 'span', props: {}, children: [ 'Eight' ] },
                { type: 'span', props: {}, children: [ 'Nine' ] },
                { type: 'span', props: {}, children: [ 'Ten' ] }
            ]);
        });
    });
    
    it('returns a className prop as a className', () => {

        const component = ReactTestRenderer.create(<span className="abc"></span>);
        expect(adapter.getAttributes(component.toJSON()), 'to equal', { className: 'abc' });
    });

    it('returns the correct classAttributeName', () => {

        expect(adapter.classAttributeName, 'to equal', 'className');
    });
});
