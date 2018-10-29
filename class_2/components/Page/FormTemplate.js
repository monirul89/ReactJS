import Premise from './Premise';
import React from 'react';

import { Header, SectionHeader, TextBox, RadioButton, CheckBox, Textarea } from 'cm-apptudio-ui';

class FormTemplate extends Premise {
  render() {
    var options = [{ value: "a", label: 'a' }, { value: "b", label: 'b' }];
    return <div className="page">
      <Header HeaderTitle="Template for Form Page" HeaderDescription="Description of the page/action/any info about the page"></Header>

      <div className="row">
        <div className="col-md-6">
          <SectionHeader HeaderTitle="Basic Details" />
          <div className="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <TextBox className="form-control" placeHolder={"Email"} />
          </div>
          <div className="form-group">
            <label for="exampleInputPassword1">Password</label>
            <TextBox className="form-control" placeHolder={"Password"} />
          </div>
          <div className="form-group">    
          <label for="exampleInputPassword1">Text Area</label>       
              <Textarea className="form-control" />            
          </div>
          <div className="Radio">    
          <div className="form-group">           
              <RadioButton inline={false} radioGroup="text" options={options} />            
          </div>
          </div>

          <div className="form-group">
            <label for="exampleInputFile">File input</label>
            <input type="file" id="exampleInputFile" />
            <p className="help-block">Example block-level help text here.</p>
          </div>
          <div className="checkbox">
         
            <div className="form-group">
           
            <CheckBox  radioGroup="text" options={options}/>
           
          </div>
           
          </div>
          <button type="submit" className="btn btn-default">Submit</button>
        </div>
        <div className="col-md-6">
          <h2 className="section-header">Documents</h2>
          <div className="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input type="email" className="form-control" id="exampleInputEmail1" placeholder="Email" />
          </div>
          <div className="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
          </div>

          <div className="form-group">
            <label for="exampleInputFile">File input</label>
            <input type="file" id="exampleInputFile" />
            <p className="help-block">Example block-level help text here.</p>
          </div>
          <div className="checkbox">
            <label>
              <input type="checkbox" /> Check me out
            </label>
          </div>
          <button type="submit" className="btn btn-default">Submit</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Panels</h2>
          <div className="row">
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Panel title</h3>
                </div>
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  Panel heading without title
                </div>
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Header elements</h2>
          <h1>h1 header element</h1>
          <h2>h2 header element</h2>
          <h3>h3 header element</h3>
          <h4>h4 header element</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Tabs</h2>
          <ul className="nav nav-tabs">
            <li role="presentation" className="active"><a href="#">Home</a></li>
            <li role="presentation"><a href="#">Profile</a></li>
            <li role="presentation"><a href="#">Messages</a></li>
          </ul>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Thumbnail</h2>
          <div className="row">
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..." />
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..." />
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..." />
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..." />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h2>Comments</h2>
          <div className="media">
            <div className="media-left">
              <a href="#">
                <img className="media-object" width="64" src="images/person.png" alt="..." />
              </a>
            </div>
            <div className="media-body">
              <h4 className="media-heading">Media heading</h4>
              Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
            </div>
          </div>

          <div className="media">
            <div className="media-left">
              <a href="#">
                <img className="media-object" width="64" src="images/person.png" alt="..." />
              </a>
            </div>
            <div className="media-body">
              <h4 className="media-heading">Media heading</h4>
              Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.

              <div className="media">
                <div className="media-left">
                  <a href="#">
                    <img className="media-object" width="64" src="images/person.png" alt="..." />
                  </a>
                </div>
                <div className="media-body">
                  <h4 className="media-heading">Media heading</h4>
                  Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Single Column</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
          <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
          <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
          <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Double Column</h2>
          <div className="row">
            <div className="col-md-6">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
              <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
              <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
              <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
            </div>
            <div className="col-md-6">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
              <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
              <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
              <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
            </div>
          </div>
        </div>
      </div>

    </div>;
  }
}

export default FormTemplate;
